import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../../context/SocketProvider';
import ReactPlayer from "react-player"
import PeerInstance from '../../services/peer';
import { toast } from 'react-toastify';

const Room = () => {

  const { socket, usersEmail, setUsersEmail } = useSocket();
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocId, setRemoteSocId] = useState(null);
  const [showSendStrBtn, setShowSendStrBtn] = useState(true);
  const [showAllowBtn, setShoAllowBtn] = useState(true);
  
  const handleUserJoined = useCallback((data) => {
    toast("User joined waiting in the lobby!");
    const { socket_id, email_id } = data;
    setUsersEmail({
      ...usersEmail,
      second_user : email_id
    })
    setRemoteSocId(socket_id)
  },[usersEmail,setUsersEmail])

  // When other user joins he can not directly join first the organizer have to allow him to join
  const handleCallUser = useCallback(async () => {
    setShoAllowBtn(false);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    const offer = await PeerInstance.getOffer();
    socket.emit("user:call",{to : remoteSocId, offer})
    setMyStream(stream);
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
    setShowSendStrBtn(false)
  },[myStream])

  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
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
    socket.on("user:joined", handleUserJoined); //This function get fired only when new user joined except first user(organizer)
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
      <h1>{showSendStrBtn ? "Welcome" : "Meet"}</h1>  
      {myStream && showSendStrBtn && <button className='btn border px-4' onClick={sendStream}>Send Stream</button>}

      {remoteSocId && showAllowBtn ? (
        myStream && remoteStream ? <></> :
        <div>
          <h6>Someone wants to join room</h6>
          <button onClick={handleCallUser} className='btn border px-4'>Allow</button>
        </div> 
      ) : <h6>Waiting for others to join room</h6>}
      <div className='d-flex gap-3' style={{marginTop : 100}}>
        {
          myStream && (
            <div className='p-4 shadow-lg'>
              <p>{usersEmail.first_user}</p>
              <ReactPlayer width={400} height={300} url={myStream} playing/>
            </div>
          )
        }
        {
          remoteStream && (
            <div className='p-4 shadow-lg'>
              <p>{usersEmail.second_user}</p>
              <ReactPlayer width={400} height={300} url={remoteStream} playing/>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Room;