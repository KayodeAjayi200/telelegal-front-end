// this holds all  streams as objects with a property
//{
//      who
//      stream = thing with tracks that plays in <video/>
//      peerConnection - actual webrtc xonnection
//}

//local, remote1, remote2+

export default (state ={}, action)=>{
    if(action.type === "ADD_STREAM"){
        const copyState = {...state};
        copyState[action.payload.who] = action.payload
        return copyState
    }else if(action.type === "LOGOUT_ACTION"){
        return {}
    }else{
        return state;
    }
}