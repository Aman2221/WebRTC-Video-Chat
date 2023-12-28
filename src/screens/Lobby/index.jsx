import React, { useCallback, useEffect, useState } from 'react'
import login_anim from "./animation.gif";
import { useSocket } from '../../context/SocketProvider';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const Lobby = () => {

  const navigate = useNavigate();
  const { socket } = useSocket();
  const { usersEmail, setUsersEmail } = useSocket();
  const [userData, setUserData] = useState({
    room_id: "",
    email_id: "",
  });

  const handleInputChange = (e) => {
    const key = e.target.name;
    setUserData({
      ...userData,
      [key]: e.target.value,
    });
  };

  const handleRequestRoomJoin = useCallback((e) => {
    e.preventDefault();
    if (userData.room_id && userData.email_id) {
      socket.emit("room:join", {
        room_id: userData.room_id,
        email_id: userData.email_id,
      });
    }
  },[userData, socket]);

  const handleRoomJoin = useCallback((data) => {
    const {  room_id, email_id } = data;
    setUsersEmail({
      ...usersEmail,
      first_user : email_id
    })
    navigate(`/room/${room_id}`)
  },[navigate, setUsersEmail, usersEmail]);

  useEffect(() => {
  
    socket.on("room:join", handleRoomJoin);
    return () => {
      socket.off("room:join", handleRoomJoin);
    }
  },[socket,handleRoomJoin])

  return (
    <div className="container d-flex justify-content-center align-items-center ">
  
      <form
        className="d-flex flex-column px-5 pt-4 pb-5 shadow-lg rounded align-items-center white bg-white"
        style={{ width: 400, marginTop: 250 }}
        onSubmit={handleRequestRoomJoin}
      >
        <img src={login_anim} alt="animated SVG" width={120} />
        <input
          onChange={handleInputChange}
          name="email_id"
          type="email"
          className="form-control"
          required
          placeholder="Enter your email here"
        />
        <input
          onChange={handleInputChange}
          name="room_id"
          type="text"
          className="form-control mt-4"
          required
          placeholder="Enter the room id here"
        />
        <button
          className="btn border mt-4 text-uppercase text-muted muted font-weight-bold w-100"
          type="submit"
        >
          Join room
        </button>
      </form>
    </div>
  )
}

export default Lobby