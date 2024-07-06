const initState = {
    current: "idle", //negotiating, progress, complete, 
    video: "off", // video is off, enabled, disabled,complete
    audio: "off", // audio is off, enabled, disabled,complete
    audioDevice: 'default', // enumerate devices, chosen audio device
    videoDevice: 'default',
    shareScreen: false,
    haveMedia: false, // is htere a local stream or not has getusermedia been run
    haveCreatedOffer: false,
}

export default (state = initState, action)=>{
    if (action.type === "UPDATE_CALL_STATUS"){
        const copyState = {...state}
        copyState[action.payload.prop] = action.payload.value
        console.log(copyState.video)
        return copyState
    }else if((action.type === "LOGOUT_ACTION") || (action.type === "NEW_VERSION")){
        return initState
    }else{
        return state
    }
}
