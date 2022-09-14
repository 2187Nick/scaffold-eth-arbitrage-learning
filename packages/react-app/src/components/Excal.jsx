import React, { useEffect, useState, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import InitialData from "../InitialData/InitialData.js";
import "../InitialData/styles.css";

/*
onChange={(elements, state) =>
            console.log("Elements :", elements, "State : ", state)
          }
          
onPointerUpdate={(payload) => console.log(payload)}
          onCollabButtonClick={() =>
            window.alert("You clicked on collab button")
          }*/

export default function Excal() {
 
  const excalidrawRef = useRef(null);

  return (
      <div className="excalidraw-wrapper">
        <Excalidraw
          ref={excalidrawRef}
          initialData={InitialData}  
        />
      </div>
  );
}



