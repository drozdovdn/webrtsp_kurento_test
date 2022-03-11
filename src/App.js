import './App.css';
import styled from "styled-components";
import {Primary} from "./components/button/input";
import {useState} from "react";
import {MyPlayer} from "./components/player";

function App() {

    const [urlCamera, setUrlCamera] = useState()
    const [urlKurento, setUrlKurento] = useState()

    const [statusMessage, setStatusMessage] = useState('')
    const [statusError, setStatusError] = useState('')

    const [active, setActive] = useState({camera: '', kurento: ''})

    const changeInputCamera = (e) => {
        setUrlCamera(e.target.value)
    }

    const changeInputKurento = (e) => {
        setUrlKurento(e.target.value)
    }

    const activeData = () => {
      setActive({
          camera: urlCamera,
          kurento: urlKurento,
      })
    }
  return (
    <Content>
      <Title>TEST RTSP URL</Title>

      <Block>
        <ItemBlock>
            <WrapperVideo>
                <MyPlayer setStatusMessage={setStatusMessage}
                        setStatusError={setStatusError}
                        setActive={setActive}
                        camera={active.camera}
                        kurento={active.kurento}/>
            </WrapperVideo>
            <ControlPanel>
                <WrapperInputBlock>
                    <TitleInput>Camera rtsp url</TitleInput>
                    <Input
                        value={urlCamera}
                        onChange={changeInputCamera}
                        placeholder={'rtsp://login:password@ip_camera:port/...'}
                    />
                </WrapperInputBlock>
                <WrapperInputBlock>
                    <TitleInput>Kurento Media Server (kms) ws url</TitleInput>
                    <Input
                        value={urlKurento}
                        onChange={changeInputKurento}
                        placeholder={'ws://host_kms:8888/kurento'}
                    />
                </WrapperInputBlock>
                <Primary onClick={activeData}>Получить поток с камеры</Primary>
            </ControlPanel>

        </ItemBlock>
        <ItemBlock>
            <WrapperStatus>
                <StatusTitle>
                    Status:
                </StatusTitle>
                <StatusBody>
                    {statusMessage}
                </StatusBody>
            </WrapperStatus>
            <WrapperError>
                <ErrorTitle>
                    Error:
                </ErrorTitle>
                <ErrorBody>
                    {statusError}
                </ErrorBody>
            </WrapperError>
        </ItemBlock>
      </Block>
    </Content>
  );
}

export default App;

const ErrorBody = styled.div`
  font-size: 14px;
  color: black;
  letter-spacing: 0.04em;
  line-height: 20px;
  padding: 0 10px;
`;
const ErrorTitle = styled.div`
  font-size: 16px;
  color: #b22626;
  font-weight: bold;
`;
const StatusBody = styled.div`
  font-size: 14px;
  color: black;
  margin-left: 10px;
  letter-spacing: 0.04em;
  line-height: 20px;
  padding: 0 10px;
`;
const StatusTitle = styled.div`
  font-size: 16px;
  color: #19c219;
  font-weight: bold;
`;

const WrapperStatus = styled.div`
  display: flex;
  align-items: flex-start;
`;
const WrapperError = styled.div`
  margin-top: 50px;
  display: flex;
  align-items: flex-start;
`;

const WrapperVideo = styled.div`
  width: 100%;
  background: #000000;
`;
const ControlPanel = styled.div`
  margin-top: 30px;
`;

const TitleInput = styled.div`
  margin: 7px 0;
  font-size: 16px;
`;

const WrapperInputBlock = styled.div`
    width: 400px;
      &:not(:last-child) {
        margin-bottom: 20px;
      }
`;

const ItemBlock = styled.div`
  padding: 20px;
  flex: 1;
  &:not(:last-child) {
    border-right: 1px solid #8d8d8d;
  }
`;

const Block = styled.div`
  display: flex;
`;
const Content = styled.div`
  padding:  10px 30px;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
`;
const Title = styled.div`
  padding: 30px;
  font-size: 24px;
  font-family: sans-serif;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  height: 100%;
  padding:10px;
  margin: 0;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #333;
  font-size: 14px;
  line-height: 1.15;
  color: #000000;
  outline: none;
  transition: ease 0.3s;
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px white inset;
  }

  ${props => (props.error ? "border: 1px solid #DE4D4D" : null)};

  &:hover {
    border-color: #898F9E;
  }

  &:focus {
    border-color: #bac2c3;
  }

  ::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    color:   #898F9E;
    opacity: 0.6;
  }
  ::-moz-placeholder {
    /* Firefox 19+ */
   color:   #898F9E;
    opacity: 0.6;
  }
  :-ms-input-placeholder {
    /* IE 10+ */
  color:   #898F9E;
    opacity: 0.6;
  }
  :-moz-placeholder {
    /* Firefox 18- */
  color:   #898F9E;
    opacity: 0.6;
   }
`;
