import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom"
import axios from 'axios';
import './VideoComponents.css'
import CallInfo from "./CallInfo";
import ChatWindow from "./ChatWindow";
import ActionButtons from "./ActionButtons";
import addStream from '../redux-elements/actions/addStream'
import { useDispatch, useSelector } from "react-redux";
import createPeerConnection from "../webRTCutilities/createPeerConnection";
import socket from '../webRTCutilities/socketConnection';
import updateCallStatus from "../redux-elements/actions/updateCallStatus";

const MainVideoPage = ()=>{


    const dispatch = useDispatch();
    const callStatus = useSelector(state=>state.callStatus)
    const streams = useSelector(state=>state.streams)
    // get query string finder hook
    const [searchParams, setSearchParams] = useSearchParams();
    const [apptInfo, setApptInfo] = useState({})
    const smallFeedEl = useRef(null); // this is a react ref  to dom element
    const largeFeedEl = useRef(null);

    useEffect(()=>{
        // fetch the user meddia
        const fetchMedia = async()=>{
            const constraints = {
                video: true, // must have at least 1 constraint set ahead, just dnt show it yet
                audio: true, 
            }
            try{
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                dispatch(updateCallStatus('haveMedia',true))// update our callStatus n reducer to know that we have the media
                // dispatch will send this function  to the redux dispatcher so akk reducers are notified
                // we send 2 args, the who, and the stream
                dispatch(addStream('localStream', stream));
                const {peerConnection, remoteStream} = await createPeerConnection();
                // we don't know 'who' we `are talking to.. yet 
                dispatch(addStream('remote1', remoteStream, peerConnection));
                // we have a peerconnection, let's make an offer
                // EXCEPT it's not time yet
                   // sdp = information about the feed, and we have NO tracks
                // socket.emit...
            }catch(err){
                console.log(err)
            }
        }
        fetchMedia()
    }, [])
 
    useEffect(()=>{
        const createOfferAsync = async()=>{
            
            //we have audio and video and need an offer. lets make it
            for (const s in streams){
                if(s !== "localStream"){
                    const pc = streams[s].peerConnection;
                    const offer = await pc.createOffer()
                    socket.emit('newOffer', {offer,apptInfo})
                }
            }
            
        }
        if(callStatus.audio === "enabled" && callStatus.video ==="enabled" && !callStatus.haveCreatedOffer){
            createOfferAsync()
        }

    },[callStatus.audio, callStatus.video])

    useEffect(()=>{
        // grab the token var out of the query string
        const token = searchParams.get('token');
        console.log(token)
        const fetchDecodedToken = async()=>{
            const resp = await axios.post('https://localhost:9000/validate-link', {token});
            console.log(resp.data);
            setApptInfo(resp.data)
        }
        fetchDecodedToken()
    },[])


   

    return(
        <div className="main-video-page">
            <div className="video-chat-wrapper">
                {/*Div to hold our remote video, our local video, and our chat window*/}
                <video id="large-feed" ref = {largeFeedEl} autoPlay controls playsInline></video>
                <video id="own-feed" ref={smallFeedEl} autoPlay controls playsInline></video>
                {apptInfo.professionalsFullName? <CallInfo apptInfo={apptInfo}/>:<></>}
                <ChatWindow/>
            </div>
            <ActionButtons 
                smallFeedEl={smallFeedEl}
                largeFeedEl={largeFeedEl} 
            />
        </div>
    )
}

export default MainVideoPage