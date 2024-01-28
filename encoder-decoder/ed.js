const encode_ed = async (text)=>{
    let buff = await Buffer.from(text);
    return await buff.toString('base64');
}

const decode_ed = async (text)=>{
    return await Buffer.from(text,"base64").toString("ascii");
}

// let a = encode_ed("hi");
// a.then((data)=>{
//     console.log(data)
// })
// let b = decode_ed(a);

module.exports = {
    encode_ed,
    decode_ed
}