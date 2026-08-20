// Bollywood Romantic Playlist Metadata
const playlist = [
  {
    title: "Arz Kiya Hai",
    artist: "Coke Studio Bharat",
    url: "./music/arz_kiya_hai.mp3",
    duration: "4:01"
  },
  {
    title: "O Jaana",
    artist: "Tere Naam",
    url: "./music/o_jaana.mp3",
    duration: "5:26"
  },
  {
    title: "Ankhon Ankhon",
    artist: "Dj Viral",
    url: "./music/ankhon_ankhon.mp3",
    duration: "3:40"
  },
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh (Aashiqui 2)",
    url: "./music/tum_hi_ho.mp3",
    duration: "4:22"
  },
  {
    title: "Tu Jo Hain",
    artist: "Ankit Tiwari (Mr. X)",
    url: "./music/tu_jo_hain.mp3",
    duration: "5:41"
  },
  {
    title: "Romantic Lofi Cover",
    artist: "Acoustic AI",
    url: "./music/romantic_lofi.mp3",
    duration: "3:02"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = playlist;
} else {
  window.playlist = playlist;
}
