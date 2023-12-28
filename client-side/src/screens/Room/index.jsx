import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../../context/SocketProvider';
import ReactPlayer from "react-player"
import PeerInstance from '../../services/peer';
const Room = () => {

  const { socket } = useSocket();
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocId, setRemoteSocId] = useState(null);
  const handleUserJoined = useCallback((data) => {
    const { socket_id } = data;
    setRemoteSocId(socket_id)
  },[])

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    const offer = await PeerInstance.getOffer();
    socket.emit("user:call",{to : remoteSocId, offer})
    setMyStream(stream)
  },[remoteSocId, socket])

  const handleIncomingCall = useCallback(async (data) => {
    const { from , offer} = data;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    setRemoteSocId(from)
    setMyStream(stream)
    const ans = await PeerInstance.getAnswer(offer);
    socket.emit("call:accepted",{to : from , ans})
  },[socket])

  const sendStream = useCallback(async (data) => {
    for(const track of myStream.getTracks()){
      PeerInstance.peer.addTrack(track,myStream);
    }
  },[myStream])

  const handleCallAccepted = useCallback(async (data) => {
    const { from, ans } = data;
    PeerInstance.setLocalDescription(ans);
    sendStream();
  },[sendStream])  

  const handleNegotiationNeeded = useCallback(async () => {
    const offer =  await PeerInstance.getOffer();
    socket.emit("peer:nego:needed",{offer, to : remoteSocId})
  
  },[remoteSocId,socket])

  const handleNegotiationFinal = useCallback(async ({ans}) => {
    await PeerInstance.setLocalDescription(ans)
  },[]);

  const handleIncomingNegotiation = useCallback(async (data) => {
    const { from, offer} = data;
    const ans = await PeerInstance.getAnswer(offer);
    socket.emit("peer:nego:done", { to:from, ans})
  },[socket])

  useEffect(() => {
    PeerInstance.peer.addEventListener('negotiationneeded',handleNegotiationNeeded);
    return ()=> {
      PeerInstance.peer.removeEventListener('negotiationneeded',handleNegotiationNeeded);
    }
  },[handleNegotiationNeeded])

  useEffect(() => {
    PeerInstance.peer.addEventListener('track', async ev=> {
      const remoteStr = ev.streams;
      setRemoteStream(remoteStr[0]);
    })
  },[]) 

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleIncomingNegotiation);
    socket.on("peer:nego:final", handleNegotiationFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleIncomingNegotiation);
      socket.off("peer:nego:final", handleNegotiationFinal);
    }
  },[socket, handleUserJoined,handleIncomingCall,handleCallAccepted,handleIncomingNegotiation,handleNegotiationFinal]);

  return (
    <div>
      <h1>Welcome</h1>
      <h2>{!remoteSocId ? "No one is there" : "You are connected"}</h2>
      {myStream && <button onClick={sendStream}>Send Stream</button>}

      {!remoteSocId ? "Not connected" : <button onClick={handleCallUser} className='btn border px-4'>Call</button>}
      {
        myStream && (
          <>
            <p>My stream</p>
            <ReactPlayer width={400} height={300} url={myStream} playing/>
          </>
        )
      }
      {
        remoteStream && (
          <>
            <p>Remote stream</p>
            <ReactPlayer width={400} height={300} url={remoteStream} playing/>
          </>
        )
      }
    </div>
  )
}

export default Room;