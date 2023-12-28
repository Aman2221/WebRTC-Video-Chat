import { createContext, useContext } from "react";
import { io } from "socket.io-client"
import { useMemo } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
    const Socket = useContext(SocketContext);
    return Socket;
}

export const SocketProvider = (props) => {
    const socket = useMemo(() => io("localhost:8015"),[])

    return (
        <SocketContext.Provider value={{socket}}>
            {props.children}
        </SocketContext.Provider>
    )
}