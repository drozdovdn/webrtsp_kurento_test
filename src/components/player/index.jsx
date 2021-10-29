import React, {useEffect, useRef, useState} from 'react'
import KurentoClient from 'kurento-client';
import {WebRtcPeer} from 'kurento-utils';
import styled from 'styled-components'
import {Preloader} from "../preloader";


export const Player = ({
                   camera,
                   kurento,
                   setStatusMessage,
                   setStatusError,
                   setActive
                }) => {
    const playerRef = useRef(null)
    const [args, setArgs] = useState(null)
    const [reInterval, setReInterval] = useState(null)
    const [urlStream, setUrlStream] = useState('')
    const [urlCamera, setUrlCamera] = useState('')
    const [showPreloader, setShowPreloader] = useState(false)



    let timeoutStop;



    useEffect(()=>{
        let webRtcPeer = null;
        let pipeLine = null;
        let reInterval = null;


        const stop = () => {

            if(webRtcPeer) {
                // console.log('stop webRtcPeer', webRtcPeer)
                webRtcPeer.dispose()
                webRtcPeer = null
                console.log('STOP')
            }
            if(pipeLine) {
                // console.log('stop pipeLine', pipeLine)
                pipeLine.release()
                pipeLine = null
                setUrlCamera('')
                setUrlStream('')
            }
        }
        const onError = (err) => {
            if(err) {
                console.error(err)
                stop()
            }
        }

        const getopts = (args, opts) => {
            let result = opts.default || {}
            args.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), ($0, $1, $2, $3) => {
                result[$1] = decodeURI($3)
            })
            return result
        }

        let args = getopts(window.location.search, {
            default: {
                ws_uri: kurento,
                ice_servers: undefined
            }
        })

        const setIceCandidateCallbacks = (webRtcPeer, webRtcEp, onerror) => {
            webRtcPeer && webRtcPeer.on('icecandidate', (candidate)=>{
                // console.log('Local candidate:',  candidate)
                candidate = KurentoClient.getComplexType('IceCandidate')(candidate);
                webRtcEp && webRtcEp.addIceCandidate(candidate, onerror)
            })

            webRtcEp && webRtcEp.on('IceCandidateFound', (event)=>{
                let candidate = event.candidate;
                // console.log("Remote candidate:", candidate)
                webRtcPeer && webRtcPeer.addIceCandidate(candidate, onerror)
            })
        }
        let options = {
            // mode: true,
            remoteVideo: playerRef.current,
            localVideo: null,
            // OfferToReceiveAudio: true
        }
        const start = () => {
            webRtcPeer = new WebRtcPeer.WebRtcPeerRecvonly(options, (error)=>{
                if(error) return onError(error)
                webRtcPeer &&  webRtcPeer.generateOffer(onOffer)
                webRtcPeer && webRtcPeer.peerConnection.addEventListener(
                    "iceconnectionstatechange",
                    event => {
                        if (webRtcPeer && webRtcPeer.peerConnection) {
                            // console.log(
                            //     "oniceconnectionstatechange -> " +
                            //     webRtcPeer.peerConnection.iceConnectionState
                            // );
                            // console.log(
                            //     "icegatheringstate -> " +
                            //     webRtcPeer.peerConnection.iceGatheringState
                            // );
                        }
                    }
                );

            })
        }

        if(args && camera.length !== 0 && kurento.length !== 0) {
            setShowPreloader(true)
            setStatusError('')
            setStatusMessage('')
            start()
            window.clearTimeout(timeoutStop)
        }

        const stopOneMinute = () => {
            setActive({camera: '', kurento: ''})
            setStatusError('')
            setStatusMessage('Прошла 1 минута, поток остановлен!')
            stop()
        }

        // const reconnect = () => {
        //     stop()
        //     setTimeout(()=>start(), 100)
        // }

        const onOffer = (error, sdpOffer) => {
            if(error) return onError(error)
            // console.log('OFFER', sdpOffer)
            return new KurentoClient(args.ws_uri, (error, client) => {
                if(error) return onError(error)

                client && client.create('MediaPipeline', (error, p)=>{
                    if(error) return onError(error)

                    pipeLine = p && p
                    // console.log('urlCameraLocal', urlCameraLocal)
                    pipeLine && pipeLine.create("PlayerEndpoint", { uri: camera, networkCache: 500, useEncodedMedia: false }, (error, player)=>{
                        if(error) return onError(error)

                        pipeLine && pipeLine.create("WebRtcEndpoint", (error, webRtc)=>{
                            if(error) return onError(error)
                            setIceCandidateCallbacks(webRtcPeer, webRtc, onError)

                            webRtc && webRtc.on('MediaStateChanged', e => {
                                console.log(e)
                                setShowPreloader(false)
                                setStatusMessage('Есть поток !')
                                timeoutStop = window.setTimeout(stopOneMinute, 60000)
                                // const dashboard_content = document.getElementById('dashboard_content')
                                // dispatch(updateShowCameras(dashboard_content.clientHeight))

                            });

                            webRtc && webRtc.processOffer(sdpOffer, (error, sdpAnswer)=>{
                                if(error) return onError(error)
                                // console.log('ANSWER', sdpOffer)
                                webRtc && webRtc.gatherCandidates(onError)
                                webRtcPeer && webRtcPeer.processAnswer(sdpAnswer, onError)
                            })


                            // player.on('EndOfStream', function(event){
                            //     pipeLine.release();
                            //     playerRef.current.src = "";
                            //
                            // });

                            player && player.connect(webRtc, (error)=>{
                                if(error) return onError(error)
                                console.log('=[Соединенние установлено!]=')
                                setStatusMessage('Соединенние установлено...')
                                player && player.play(error => {
                                    if (error) return onError(error);
                                    console.log("Player playing ...");
                                    setStatusMessage('Player playing ...')
                                });

                            })
                            player && player.on("EndOfStream", () => {
                                // console.log("EndOfStream");
                                // window.location.reload()
                                // reInterval = setInterval(reconnect, 100);
                                stop()
                                setTimeout(()=> start(),100)
                            });

                            player && player.on("Error", (error) => {
                                if(error) {
                                    console.error("Error", error)
                                    if(error.description === "Invalid URI") {
                                        setStatusError('Invalid URL -> Куренто не может достучатся до камеры, либо ошибка в ссылке, либо камера по данному адресу не доступна')
                                    }

                                }
                            });

                        })

                    })


                })
            })
        }

        window.addEventListener('unload', ()=>{
            stop() //разрываю соединение при перезагрузке/уходе/новой загрузке страницы
        })
        return ()=>{
            stop() //разрываю соединение при перерендере
        }
    },[camera, kurento])

    console.log({camera})
    console.log({kurento})

    return (
        <Content>
            {
                <>
                    <PlayerComponent
                        showPreloader={showPreloader}
                        playsinline
                        autoPlay
                        muted
                        ref={playerRef}
                    />
                    {
                        showPreloader &&
                        <WrapperPreloader>
                            <Preloader/>
                        </WrapperPreloader>

                    }
                    {/*{*/}
                    {/*    (showPreloader && urlStream === '') ?*/}
                    {/*        <WrapperPreloader>*/}
                    {/*            <PlayerSkeletonLoading/>*/}
                    {/*        </WrapperPreloader> :*/}
                    {/*        (urlStream === ERROR_REQUEST_LINK) &&*/}
                    {/*        <InfoPlayerBlock>*/}
                    {/*            <InfoPlayerTitle>Видеопоток недоступен</InfoPlayerTitle>*/}
                    {/*            <InfoPlayerDesc>Проверьте подключение камеры к питанию, сети и HEAVEN connect </InfoPlayerDesc>*/}
                    {/*            <InfoPlayerDescLink onClick={()=>repeatRequest()}>Попробовать снова</InfoPlayerDescLink>*/}
                    {/*        </InfoPlayerBlock>*/}
                    {/*}*/}
                </>
            }
        </Content>
    );
}

const WrapperPreloader = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const InfoPlayerTitle = styled.div`
  font-family: 'Lato', sans-serif;
  color: #0D2733;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  padding-bottom: 15px;
  position: relative;
  &:after {
    position: absolute;
    width: 367px;
    height: 1px;
    content: '';
    background: radial-gradient(50.04% 89779994.43% at 50% 46.28%, #FF2D5F 0%, #FFC42D 100%);
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
  }
`;
const InfoPlayerDesc = styled.div`
  margin-top: 12px;
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  font-family: 'Lato', sans-serif;
  color: rgba(13, 39, 51, 0.7);
  white-space: nowrap;
  font-weight: 400;
`;
const InfoPlayerDescLink = styled.div`
  font-weight: 600;
  margin-top: 10px;
  color: #017EB1;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
const InfoPlayerBlock = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const PlayerComponent = styled.video`
  background: #ababab;
  border-radius: 10px;
  width: 100%;
  height: 100%;
  transition: all 0.1s linear;
  opacity: ${({showPreloader}) => showPreloader ? 0 : 1};
`;
const Content = styled.div`
  border-radius: 10px;
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
