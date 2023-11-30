// Importation des modules nécessaires
import { createServer } from "http";
import { Server } from "socket.io";

// Création d'un serveur HTTP.
const httpServer = createServer();

// Initialisation du serveur socket.io sur le serveur HTTP.
// Configuration pour autoriser les requêtes CORS depuis localhost:3000.
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
  // Autres options possibles ici.
});

// Un objet Map pour stocker les utilisateurs connectés.
const users = new Map();

// Événement déclenché lorsqu'un nouveau client se connecte.
io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  // Lorsqu'un client envoie son nom d'utilisateur après la connexion.
  socket.on('register', (username) => {
    // Stocker le nom d'utilisateur avec l'ID du socket correspondant.
    users.set(socket.id, username);
    console.log(`${username} s'est connecté`);
  });

  // Lorsqu'un client se déconnecte.
  socket.on('disconnect', () => {
    // Récupérer le nom d'utilisateur à partir de l'ID du socket, ou utiliser 'Anonyme'.
    const username = users.get(socket.id) || 'Anonyme';
    console.log(`${username} s'est déconnecté`);

    // Informer les autres clients que cet utilisateur a arrêté de taper.
    socket.broadcast.emit('userTyping', { user: username, typing: false });

    // Supprimer l'utilisateur de la liste.
    users.delete(socket.id);
  });

  // Lorsqu'un client envoie un message de chat.
  socket.on('chatMessage', (msg) => {
    // Diffuser le message à tous les clients connectés.
    io.emit('chatMessage', msg);
  });

  // Lorsqu'un utilisateur commence ou arrête de taper.
  socket.on('userTyping', (data) => {
    // Informer les autres clients du statut de frappe de l'utilisateur.
    socket.broadcast.emit('userTyping', data);
  });
});

// Démarrage du serveur sur le port spécifié.
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Serveur à l'écoute sur le port ${PORT}`));
