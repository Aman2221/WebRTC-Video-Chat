import { createContext, useContext } from "react";
import { io } from "socket.io-client"
import { useMemo, useState } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
    const Socket = useContext(SocketContext);
    return Socket;
}

export const SocketProvider = (props) => {
    const socket = useMemo(() => io("localhost:8015"),[])
    const [usersEmail, setUsersEmail] = useState({
        first_user : "",
        second_user : ""
    });

    return (
        <SocketContext.Provider value={{socket, usersEmail, setUsersEmail}}>
            {props.children}
        </SocketContext.Provider>
    )
}