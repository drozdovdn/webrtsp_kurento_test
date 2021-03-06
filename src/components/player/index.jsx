import React, {useEffect, useRef, useState} from 'react'
import "../../../node_modules/video-react/dist/video-react.css";
import KurentoClient from 'kurento-client';
import {WebRtcPeer} from 'kurento-utils';
import styled from 'styled-components'
import {Preloader} from "../preloader";

export const MyPlayer = ({
                   camera,
                   kurento,
                   setStatusMessage,
                   setStatusError,
                }) => {
    let playerRef = useRef(null)
    const [showPreloader, setShowPreloader] = useState(false)

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
                                setStatusMessage('???????? ?????????? !')
                                // timeoutStop = window.setTimeout(stopOneMinute, 60000)
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
                                console.log('=[?????????????????????? ??????????????????????!]=')
                                setStatusMessage('?????????????????????? ??????????????????????...')
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
                                        setStatusError('Invalid URL -> ?????????????? ???? ?????????? ???????????????????? ???? ????????????, ???????? ???????????? ?? ????????????, ???????? ???????????? ???? ?????????????? ???????????? ???? ????????????????')
                                    }

                                }
                            });

                        })

                    })


                })
            })
        }

        window.addEventListener('unload', ()=>{
            stop() //???????????????? ???????????????????? ?????? ????????????????????????/??????????/?????????? ???????????????? ????????????????
        })
        return ()=>{
            stop() //???????????????? ???????????????????? ?????? ??????????????????????
        }
    },[camera, kurento])

    return (
        <Content>
            <PlayerComponent
                showPreloader={showPreloader}
            >
                <Video
                ref={playerRef}
                playsinline
                autoPlay={true}
                muted
                />
            </PlayerComponent>
            {
                showPreloader &&
                <WrapperPreloader>
                    <Preloader/>
                </WrapperPreloader>

            }
        </Content>
    );
}
const Video = styled.video`
width: 100%;
max-height: 400px;
`;
const WrapperPreloader = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const PlayerComponent = styled.div`
  background: #000000;
  border-radius: 10px;
  width: 100%;
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
