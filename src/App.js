import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import WheelComponent from "./wheel-of-names";
import ReactConfetti from "react-confetti";
import { AudioPlayer } from "react-audio-play"; 

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function Wheel() {
  
  useEffect(() => {
    document.body.style.backgroundColor = "#2371b9";

    // Cleanup on component unmount
    return () => {
      document.body.style.backgroundColor = ""; // Reset to default or previous background color
    };
  }, []); // Empty dependency array ensures this runs only once when the component mounts
  

  const [prize, setPrize] = useState(null);
  const [segments, setSegments] = useState([]);
  const [confetti, setConfetti] = useState(false);
  const [winner, setWinner] = useState(null);
  const [audioSource, setAudioSource] = useState(null);
  const audioPlayerRef = useRef(null); 
  const segColors = ['#B20000', '#006400']; // Darker Red and Darker Green

  const [showModal, setShowModal] = useState(false);
  const [customPrize, setCustomPrize] = useState("");
  const [selectedRound, setSelectedRound] = useState("1");
  const [winningSegment, setWinningSegment] = useState(null);

  const customPrizeRef = useRef(customPrize);
  
  // const handleFileUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const formData = new FormData();
  //     formData.append("file", file);
  
  //     try {
  //       // Make the POST request using axios
  //       const response = await axios.post("/upload-file", formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data", // Important for file upload
  //         },
  //       });
  
  //       // Check if the response contains the expected 'segments' data
  //       if (response.data && response.data.segments) {
  //         setSegments(response.data.segments);
  //       } else {
  //         console.error("Error: Segments not found in response");
  //       }
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //     }
  //   }
  // };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = () => {
        const fileContent = reader.result;
        const lines = fileContent.split("\n"); // Split by lines
        const newSegments = lines
          .filter(line => line.trim()) // Filter out any empty lines
          .map(line => {
            const [name, category] = line.split(",").map(item => item.trim()); // Split by comma and trim spaces
            return { name, category }; // Create a segment object
          });
  
        setSegments(newSegments); // Update the segments state with the parsed data
      };
  
      reader.onerror = () => {
        console.error("Error reading file.");
      };
  
      reader.readAsText(file); // Reads the file as text
    }
  };
  
  
  useEffect(() => {
    customPrizeRef.current = customPrize; 
  }, [customPrize]); 

  // Function to HEX generator for random color
  function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]; 
    }
    return color;
  }


  // const numberOfNewColors = 104;
  // for (let i = 0; i < numberOfNewColors; i++) {
  //   segColors.push(generateRandomColor());
  // }
  const onFinished = (winner) => {
    console.log("Winner:", winner);
    // const prizeForWinner = customPrize ? customPrize : "No prize available";
    const prizeForWinner = customPrizeRef.current || "No prize available"; // Access prize from ref
    setAudioSource("/celebrate.mp3");
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
      audioPlayerRef.current.play();
    }
  
    setTimeout(() => {
      setSegments((prevSegments) => prevSegments.filter((segment) => segment !== winner));
    }, 20000);
  
    setConfetti(true);
  

    console.log("after finish",customPrize);
    console.log("after finish 2",prizeForWinner);
    setPrize(prizeForWinner);
    setWinner(winner.name);
    console.log("winningsegment on finish",winningSegment);
    setTimeout(() => {
      setPrize(null);
    }, 5000);
  
    setTimeout(() => {
      setConfetti(false);
      setWinningSegment(null); // Clear the winning segment
    }, 10000);
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "auto";
    };
  }, []);

  const wheelKey = segments.join("-");

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stop();
      audioPlayerRef.current.play();
    }
  }, [audioSource]);

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSubmit = () => {
    console.log("selected round", selectedRound);
    console.log("selected Prize", customPrize);
    // Filter the updated segments
    const filteredSegments = segments.filter(
      (segment) => segment.category === `Round ${selectedRound}`
    );
  
    if (filteredSegments.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSegments.length);
      const randomSegment = filteredSegments[randomIndex];
      setWinningSegment(randomSegment); // Set the winning segment
    } else {
      setWinningSegment(null); // Ensure no segment is preselected if the round has no segments
    }
    setSelectedRound("1");
    // Close the modal
    setShowModal(false);
  };
  


  console.log("chosen winner", winningSegment);
  return (
    <div
      id="wheelCircle"
      style={{
        display: "flex",
        justifyContent: "center",
        paddingBottom: "150px",
        paddingLeft: "150px",
        position: "relative",
        overflow: "hidden", 
      }}
    >
      {confetti && <ReactConfetti width={windowWidth} height={windowHeight} />}

      {/* Hidden Player */}
      <AudioPlayer
        ref={audioPlayerRef}
        src={audioSource}
        autoPlay={false}
        loop={false}
        onPlay={() => console.log("Music started")}
        style={{ display: "none" }} 
      />

      <WheelComponent
        key={wheelKey}
        segments={segments}
        segColors={segColors}
        winningSegment={winningSegment}
        onFinished={(winner) => onFinished(winner)}
        primaryColor="black"
        primaryColoraround="#ffffffb4"
        contrastColor="white"
        buttonText="Spin"
        isOnlyOnce={true}
        upDuration={50} 
        downDuration={4000}
        spinDuration={30000}
        onSpinStart={() => {
          // Play the audio when the spin starts
          setAudioSource("/winner.mp3");
          const audio = document.querySelector('audio');
          if (audio) {
            // Only play if the user has interacted with the document
            if (audio.paused) {
              audio.play().catch(err => {
                console.error("Failed to play audio:", err);
              });
            }
          } else {
            console.log("Audio element not found.");
          }
        }}
      />

      {(winner && prize) && (
        <div
          style={{
            position: "absolute",
            top: "-5px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "10px",
            borderRadius: "10px",
            zIndex: 10,
          }}
        >
          {`Winner: ${winner} - Prize: ${prize}`}
        </div>
      )}


          {/* Prize input and round select */}
      {/* Prize input and round select in a modal */}
      {showModal && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "20px",
            borderRadius: "10px",
            color: "#fff",
            zIndex: 100,
            width: "300px",
          }}
        >
          <h3>Enter Prize and Select Round</h3>
          <input
            type="text"
            placeholder="Enter a custom prize"
            value={customPrize}
            onChange={(e) => setCustomPrize(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #fff",
              color: "#fff",
              backgroundColor: "transparent",
              marginBottom: "10px",
              width: "92%",
            }}
          />
          <div>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #fff",
                color: "#fff",
                backgroundColor: "transparent",
                width: "100%",
              }}
            >
              <option value="1" style={{ color: "black", backgroundColor: "#fff" }}>Round 1</option>
            <option value="2" style={{ color: "black", backgroundColor: "#fff" }}>Round 2</option>
            <option value="3" style={{ color: "black", backgroundColor: "#fff" }}>Round 3</option>
            <option value="4" style={{ color: "black", backgroundColor: "#fff" }}>Round 4</option>
            </select>
          </div>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={handleModalSubmit}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #fff",
                color: "#fff",
                backgroundColor: "#28a745",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
            <button
              onClick={handleModalClose}
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #fff",
                color: "#fff",
                backgroundColor: "#dc3545",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Button to open the modal */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: "absolute",
          left: "20px",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "1px solid #fff",
          color: "#fff",
          backgroundColor: "#007bff",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        Open Prize Modal
      </button>

       {/* Input field for uploading the text file */}
       <input 
        type="file" 
        id="fileInput" 
        style={{ position: "absolute", top: "20px", right: "20px" }} 
        onChange={handleFileUpload} 
      />
    </div>

    
  );
}

export default Wheel;

