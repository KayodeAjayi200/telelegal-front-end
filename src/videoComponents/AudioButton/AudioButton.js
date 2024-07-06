import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react";
import ActionButtonCaretDropdown from "../ActionButtonCaretDropdown";
import getDevices from "../../webRTCutilities/getDevices";
import updateCallStatus from "../../redux-elements/actions/updateCallStatus";
import addStream from "../../redux-elements/actions/addStream"; 
import startAudioStream from "./startAudioStream";

const AudioButton = ({smallFeedEl})=> {

    const dispatch = useDispatch()
    const callStatus = useSelector(state=>state.callStatus);

    const streams = useSelector(state=>state.streams);
    const [caretOpen, setCaretOpen] = useState(false);
    const [audioDeviceList, setAudioDeviceList] = useState([]);

    let micText;
    if(callStatus.audio === "off"){
        micText = "Join Audio"
    }else if(callStatus.audio === "enabled"){
        micText = "Mute"
    }else{
        micText = "Unmute"
    }

    useEffect(()=>{
        const getDevicesAsync =  async()=>{
            if(  caretOpen ){
                // we need to  check  fr devices
                const devices = await getDevices()
                console.log(devices.audioDevices)
                setAudioDeviceList(devices.audioOutputDevices.concat(devices.audioInputDevices))
            }
        }
        getDevicesAsync()
    },[caretOpen])

    const startStopAudio =()=>{
        if(callStatus.audio==="enabled"){ 
            // update redux callStatus
            dispatch(updateCallStatus('audio',"disabled"));
            // set the stream to disabled
            const tracks = streams.localStream.stream.getAudioTracks();
            tracks.forEach(t => t.enabled = false);
        }else if(callStatus.audio==="disabled"){
            // second, check if video is disabled, if so enable
            // update redux callStatus
            dispatch(updateCallStatus('audio',"enabled")); 
            const tracks = streams.localStream.stream.getAudioTracks();
            tracks.forEach(t => t.enabled = true);
        }else{
            // audio is off, what do we do
            changeAudioDevice({target:{value:"inputdefault"}})
            // add tracks
            startAudioStream(streams);
        }
    }

    const changeAudioDevice = async(e)=>{
        // the user changed the desired input or output audio devie 

        //1. we need to get the deviceid and the type
        const deviceId = e.target.value.slice(5);
        const audioType = e.target.value.slice(0,5);
        //2. we need to user getUserMedia(permission)
        if(audioType === "output"){
            // we are now done, we don't care about the output for any other reason
            smallFeedEl.current.setSinkId(deviceId);
        }else if(audioType === "input"){
            const newConstraints = {
                audio: {deviceId: {exact: deviceId}},
                video: callStatus.videoDevice === "default"? true: {deviceId: {exact: callStatus.videoDevice }}
            }

            const stream = await navigator.mediaDevices.getUserMedia(newConstraints)

            //3.  update redux with that audiodevice
            dispatch(updateCallStatus('audioDevice', deviceId));
            dispatch(updateCallStatus('audio','enabled'))

            //5. update localstream in streams
            dispatch(addStream('localStream', stream))

            // add tracks - actually replacetracks
            const tracks = stream.getAudioTracks();
        }
    }
    
    return(
        <div className="button-wrapper d-inline-block">
            <i className="fa fa-caret-up choose-audio" onClick = {()=>setCaretOpen(!caretOpen)}></i>
            <div className="button mic" onClick={startStopAudio}>
                <i className="fa fa-microphone"></i>
                <div className="btn-text">{micText}</div>
            </div>
            {caretOpen? <ActionButtonCaretDropdown
                        defaultValue={callStatus.audioDevice}
                        changeHandler={ changeAudioDevice}
                        deviceList={audioDeviceList}
                        type = "audio"
                    />:<></>}
        </div>
        
    )
}

export default AudioButton