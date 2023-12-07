import React, {useContext} from "react";
import { DataContext } from "./Context";

function Home() {
    const {user} = useContext(DataContext)

    if(user.username){
        return (
            <div>
                <h1>Shoply</h1>
                <h2>Welcome {user.username}</h2>
            </div>
        )
    }

    return (
        <div>
            <h1>Shoply</h1>
            <h2>Please register or login</h2>
        </div>
    )
}

export default Home