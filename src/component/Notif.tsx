// <!DOCTYPE html>
// <html>
// <head>
//   <title>Tender Notifications</title>
//   <style>
//     body { font-family: Arial, sans-serif; margin: 20px; background: #f4f4f4; }
//     .notification { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
//     .notification h3 { margin: 0 0 10px; color: #007bff; }
//     .notification p { margin: 5px 0; }
//     .notification a { color: #007bff; text-decoration: none; }
//   </style>
// </head>
// <body>
//   <h1>Tender Notifications</h1>
//   <div id="notifications"></div>

//   <script>
//     const userId = 100; // Replace with authenticated user ID
//     const ws = new WebSocket(`ws://localhost:8080/?userId=${userId}`);

//     ws.onopen = () => console.log('Connected to WebSocket server');
//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const notificationDiv = document.createElement('div');
//       notificationDiv.className = 'notification';
//       notificationDiv.innerHTML = `
//         <h3>New Tender: ${data.title}</h3>
//         <p>${data.context}</p>
//         <p><a href="https://your-app.com/tenders/${data.tenderId}">View Tender</a></p>
//         <p><small>Received: ${new Date(data.timestamp).toLocaleString()}</small></p>
//       `;
//       document.getElementById('notifications').prepend(notificationDiv);
//     };
//     ws.onclose = () => console.log('Disconnected from WebSocket server');
//     ws.onerror = (error) => console.error('WebSocket error:', error);
//   </script>
// </body>
// </html>