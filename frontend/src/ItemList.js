import React, {useContext} from "react";
import {Redirect} from 'react-router-dom'
import {DataContext} from "./Context";
import ItemCard from "./ItemCard";

function ItemList() {
    const {items, user} = useContext(DataContext)

    if (!user.username) {
        return (<Redirect to='/' />)
    }

    return(
        <div>
            {items.map(item => (
                <ItemCard endpoint='/items' item={item} key={item.id}/>
            ))}
        </div>
    )
}

export default ItemList