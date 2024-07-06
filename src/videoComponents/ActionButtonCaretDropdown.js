const ActionButtonCaretDropdown = ({defaultValue,changeHandler,deviceList, type})=>{

    let dropdownEl;
    if(type ==="video"){
        dropdownEl = deviceList.map(vd=><option key={vd.deviceId} value={vd.deviceId}>{vd.label}</option>)
    }else if (type==="audio"){
        const audiInputEl = [];
        const audioOutputEl = [];
        deviceList.forEach((d,i) => {
            if(d.kind === "audioinput"){
                audiInputEl.push(<option key={`input${d.deviceId}`} value={`input${d.deviceId}`}>{d.label}</option>)
            }else if(d.kind === "audiooutput"){
                audioOutputEl.push(<option key={`output${d.deviceId}`} value={`output${d.deviceId}`}>{d.label}</option>)
            }
        });
        audiInputEl.unshift(<optgroup label="Input Devices"/>)
        audioOutputEl.unshift(<optgroup label="Output Devices"/>)
        dropdownEl = audiInputEl.concat(audioOutputEl)
    }

    return(
        <div className="caret-dropdown" style={{top:"-25px"}}> 
            <select defaultValue={defaultValue} onChange={changeHandler}>
            {dropdownEl} 
            </select>
        </div>
    )
}

export default ActionButtonCaretDropdown