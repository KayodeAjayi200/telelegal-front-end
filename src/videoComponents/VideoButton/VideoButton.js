import { useDispatch, useSelector } from "react-redux";

import { startTransition, useEffect, useState } from 'react';
import startLocalVideoStream from "./startLocalVideoStream";
import updateCallStatus from "../../redux-elements/actions/updateCallStatus";
import getDevices from "../../webRTCutilities/getDevices";
import addStream from "../../redux-elements/actions/addStream";
import ActionButtonCaretDropdown from "../ActionButtonCaretDropdown";

const VideoButton = ({smallFeedEl})=>{


    const dispatch = useDispatch();
    const callStatus = useSelector(state=>state.callStatus)
    const streams = useSelector(state=>state.streams);
    const [pendingUpdate, setPendingUpdate] = useState(false);
    const [caretOpen, setCaretOpen] = useState(false);
    const [videoDeviceList, setVideoDeviceList] = useState([]);


    useEffect(()=>{
        const getDevicesAsync =  async()=>{
            if(  caretOpen ){
                // we need to  check  fr devices
                const devices = await getDevices()
                console.log(devices.videoDevices)
                setVideoDeviceList(devices.videoDevices)
            }
        }
        getDevicesAsync()
    },[caretOpen])

    const changeVideoDevice = async(e)=>{
        // the usr changed the desired video device
        // 1. we need to get the deviceId
        const deviceId = e.target.value;
        //console.log(deviceId)
        // 2. we need getusermedia again (permission)
        const newConstraints = {
            audio: callStatus.audioDevice === "default"? true: {deviceId: {exact: callStatus.audioDevice}},
            video: {deviceId: {exact: deviceId}}
        }
        const stream = await navigator.mediaDevices.getUserMedia(newConstraints)
        // 3. update redux with that videoDevice, and that video is enabled
        dispatch(updateCallStatus('videoDevice',deviceId));
        dispatch(updateCallStatus('video', 'enabled'))
        //4. update the smallFeedEl
        smallFeedEl.current.srcObject = stream;
        //5. we need to update the localstream in streams
        dispatch(addStream('localStream', stream))
        //6. add tracks
        const tracks  = stream.getVideoTracks();
        // come back to this later
        // if we stop the old tracks, and add the new tracks, that will mean renogatiation
    }
    const startStopVideo = ()=>{
        // first, check if the video is enabled, if so disable it
        if(callStatus.video==="enabled"){ 
            // update redux callStatus
            dispatch(updateCallStatus('video',"disabled"));
            // set the stream to disabled
            const tracks = streams.localStream.stream.getVideoTracks();
            tracks.forEach(t => t.enabled = false);
        }else if(callStatus.video==="disabled"){
            // second, check if video is disabled, if so enable
            // update redux callStatus
            dispatch(updateCallStatus('video',"enabled")); 
            const tracks = streams.localStream.stream.getVideoTracks();
            tracks.forEach(t => t.enabled = true);
        }
        // thirdly, check to see if we have the medi, if so start the stream
        else if(callStatus.haveMedia){
            console.log(callStatus)
            // we have the media show the feed 

            smallFeedEl.current.srcObject = streams.localStream.stream
            // add tracks to the existing peer connection
            startLocalVideoStream(streams, dispatch);
        }else{
            // lastly, it is possible we do not have the media yet, wait for the media then start the stream
           setPendingUpdate(true);
        }
    }

    useEffect(()=>{
            if(pendingUpdate && callStatus.haveMedia){
                console.log('pending update succeeded')
                // this useeffect will run if pendingupdate is true
                setPendingUpdate(false) // switch basck to false
                smallFeedEl.current.srcObject = streams.localStream.stream
                startLocalVideoStream(streams, dispatch);
            }

        },[pendingUpdate,callStatus.haveMedia]
        
    )

    return(
        <div className="button-wrapper video-button d-inline-block">
        <i className="fa fa-caret-up choose-video" onClick = {()=>setCaretOpen(!caretOpen)}></i>
        <div className="button camera" onClick={startStopVideo}>
            <i className="fa fa-video"></i>
            <div className="btn-text">{callStatus.video === "enabled" ? "Stop" : "Start"} Video</div>
        </div>
        {caretOpen? <ActionButtonCaretDropdown 
                        defaultValue={callStatus.videoDevice}
                        changeHandler={ changeVideoDevice}
                        deviceList={videoDeviceList}
                        type = "video"
                    />:<></>}
        </div>
    )
}

export default VideoButton;