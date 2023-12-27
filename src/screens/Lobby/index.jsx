import React, { useCallback, useState } from 'react'
import login_anim from "./animation.gif";

const Lobby = () => {

//     const { socket } = useSocket();
//   const navigate = useNavigate();

  const [userData, setUserData] = useState({
    room_id: "",
    user_id: "",
  });

  const handleInputChange = (e) => {
    const key = e.target.name;
    setUserData({
      ...userData,
      [key]: e.target.value,
    });
  };


    const handleRoomJoin = useCallback(() => {

    },[]);

  return (
    <div className="container d-flex justify-content-center align-items-center">
      <form
        className="border d-flex flex-column px-5 pt-4 pb-5 shadow-sm rounded align-items-center"
        style={{ width: 400, marginTop: 200 }}
        onSubmit={handleRoomJoin}
      >
        <img src={login_anim} alt="animated SVG" width={120} />
        <input
          onChange={handleInputChange}
          name="user_id"
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
          className="btn border mt-4 text-uppercase font-weight-bold w-100"
          type="submit"
        >
          Join room
        </button>
      </form>
    </div>
  )
}

export default Lobby