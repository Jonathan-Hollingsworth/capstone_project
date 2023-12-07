import React, {useContext} from "react";
import { DataContext } from "./Context";
import "./Home.css"

function Home() {
    const {user} = useContext(DataContext)

    if(user.username){
        return (
            <div className="home">
                <h1>Shoply</h1>
                <h2>Welcome "{user.username}"</h2>
            </div>
        )
    } //If user is currently logged in

    return (
        <div className="home">
            <h1>Shoply</h1>
            <h2>Please register or login</h2>
        </div>
    )
}

export default Home