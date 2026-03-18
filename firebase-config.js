// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAAV4D9ujtxJ2mhE7oJw5uwb60shjztJaU",
    authDomain: "cotacao---alf.firebaseapp.com",
    databaseURL: "https://cotacao---alf-default-rtdb.firebaseio.com",
    projectId: "cotacao---alf",
    storageBucket: "cotacao---alf.firebasestorage.app",
    messagingSenderId: "505480664351",
    appId: "1:505480664351:web:b0a54e0e13cf94882f0c2a",
    measurementId: "G-J1YYRDVX23"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const analytics = firebase.analytics();

// Exportar para uso em outros arquivos
window.database = database;
window.analytics = analytics;
