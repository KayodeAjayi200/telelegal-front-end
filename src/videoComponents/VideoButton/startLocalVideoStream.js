import updateCallStatus from "../../redux-elements/actions/updateCallStatus";

//  this function's job is to update all peer connections (addtracks) and update all redux callstatus\

const startLocalVideoStream =(streams, dispatch)=>{
   const localStream = streams.localStream;

   for (const s in streams){
    // s in the key
        if(
            s!=="localStream"
        ){// we don't add tracks to the localStream
            const curStream = streams[s];
            // add tracks to all peerconnection
            localStream.stream.getVideoTracks().forEach(t => {
                curStream.peerConnection.addTrack(t, curStream.stream);
            });
            // update redux callStatus
            dispatch(updateCallStatus('video',"enabled"));
        }
   }

}

export default startLocalVideoStream;
