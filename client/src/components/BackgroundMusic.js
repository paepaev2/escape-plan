import React, { useRef, useState } from "react";
import muteIcon from "../assets/audio-is-off.png"; // Path to mute icon
import unmuteIcon from "../assets/audio-is-on.png"; // Path to unmute icon

const BackgroundMusic = () => {
    const audioRef = useRef(null);
    const [audioIsOn, setAudioIsOn] = useState(false);

    const toggleAudio = () => {
        if (audioIsOn) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setAudioIsOn(!audioIsOn);
    };

    return (
        <div className="fix bottom-8 right-8">
            <audio ref={audioRef} src="/music/game-bgm.mp3" loop hidden />
            <button onClick={toggleAudio} className="bg-transparent border-none cursor-pointer">
                <img src={audioIsOn ? unmuteIcon : muteIcon} alt={audioIsOn ? "Unmute" : "Mute"} style={{ width: "24px", height: "24px" }} />
            </button>
        </div>
    );
};

export default BackgroundMusic;
