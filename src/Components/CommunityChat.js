import React, { useState, useEffect, useRef } from 'react';
import './CommunityChat.css';

const CommunityChat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [loading, setLoading] = useState(false);
  const [moderationResult, setModerationResult] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageFilter, setMessageFilter] = useState('all'); // all, my-team, predictions
  const messagesEndRef = useRef(null);

  // OpenAI Moderation API configuration
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  const MODERATION_API_URL = 'https://api.openai.com/v1/moderations';
  const CHAT_API_URL = process.env.REACT_APP_CHAT_API_URL || '/api/chat';

  // Chat rooms configuration
  const chatRooms = {
    general: { name: 'General Discussion', emoji: '💬', description: 'Talk about college sports' },
    predictions: { name: 'Predictions & Bets', emoji: '🎯', description: 'Share your predictions' },
    'sec': { name: 'SEC Talk', emoji: '🏈', description: 'SEC teams discussion' },
    'big-ten': { name: 'Big Ten Talk', emoji: '🌟', description: 'Big Ten teams discussion' },
    'big-12': { name: 'Big 12 Talk', emoji: '⚡', description: 'Big 12 teams discussion' },
    'acc': { name: 'ACC Talk', emoji: '🔥', description: 'ACC teams discussion' },
    'basketball': { name: 'Basketball Talk', emoji: '🏀', description: 'College basketball discussion' },
    'trash-talk': { name: 'Trash Talk Zone', emoji: '😤', description: 'Friendly team rivalry (moderated)' }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when room changes
  useEffect(() => {
    if (user) {
      loadMessages();
      joinRoom();
    }
  }, [selectedRoom, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // AI Content Moderation using OpenAI
  const moderateMessage = async (message) => {
    try {
      const response = await fetch(MODERATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          input: message
        })
      });

      if (!response.ok) {
        throw new Error('Moderation API error');
      }

      const data = await response.json();
      const result = data.results[0];

      // Custom moderation logic for sports trash talk
      const isAllowedTrashTalk = await checkSportsTrashTalk(message);
      
      return {
        flagged: result.flagged && !isAllowedTrashTalk,
        categories: result.categories,
        category_scores: result.category_scores,
        isTrashTalk: isAllowedTrashTalk,
        message: message
      };
    } catch (error) {
      console.error('Moderation error:', error);
      // Fallback moderation
      return await fallbackModeration(message);
    }
  };

  // Custom sports trash talk checker
  const checkSportsTrashTalk = async (message) => {
    const sportsTrashTalkPrompt = `
    Analyze this message to determine if it's acceptable sports trash talk or crosses the line:

    Message: "${message}"

    Acceptable sports trash talk includes:
    - Boasting about your team's performance
    - Playful rivalry between teams
    - Predictions about game outcomes
    - Team comparisons and statistics
    - Celebrating wins or mourning losses
    - Friendly competitive banter

    NOT acceptable:
    - Personal attacks on individuals
    - Profanity or vulgar language
    - Threats of violence
    - Discriminatory language
    - Harassment
    - Off-topic content

    Respond with only "ALLOWED" or "BLOCKED" and a brief reason.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a sports chat moderator. Your job is to allow friendly team rivalry and trash talk while blocking inappropriate content.'
            },
            {
              role: 'user',
              content: sportsTrashTalkPrompt
            }
          ],
          max_tokens: 100,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const result = data.choices[0].message.content.toLowerCase();
      
      return result.includes('allowed');
    } catch (error) {
      console.error('Sports moderation error:', error);
      return false;
    }
  };

  // Fallback moderation without API
  const fallbackModeration = async (message) => {
    const profanityList = ['damn', 'hell', 'crap']; // Add your list
    const threatWords = ['kill', 'die', 'hurt', 'violence'];
    const personalAttacks = ['idiot', 'stupid', 'moron'];

    const lowerMessage = message.toLowerCase();
    
    const hasProfanity = profanityList.some(word => lowerMessage.includes(word));
    const hasThreats = threatWords.some(word => lowerMessage.includes(word));
    const hasPersonalAttacks = personalAttacks.some(word => lowerMessage.includes(word));

    return {
      flagged: hasThreats || hasPersonalAttacks,
      categories: {
        hate: hasPersonalAttacks,
        harassment: hasThreats,
        violence: hasThreats
      },
      isTrashTalk: !hasThreats && !hasPersonalAttacks,
      message: message,
      fallback: true
    };
  };

  // Send message with moderation
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    
    try {
      // Moderate the message first
      const moderation = await moderateMessage(newMessage.trim());
      setModerationResult(moderation);

      if (moderation.flagged) {
        alert('Your message was blocked by our AI moderator. Please keep the conversation respectful and focused on sports.');
        setLoading(false);
        return;
      }

      // Send message to your real chat API
      const messageData = {
        id: Date.now(),
        user: {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=2d5016&color=fff`,
          favoriteTeam: user.favoriteTeam || 'College Sports Fan'
        },
        message: newMessage.trim(),
        room: selectedRoom,
        timestamp: new Date().toISOString(),
        moderation: {
          checked: true,
          isTrashTalk: moderation.isTrashTalk,
          safe: true
        }
      };

      // Send to your backend
      await fetch(`${CHAT_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(messageData)
      });

      // Add to local state immediately for responsiveness
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load messages from your backend
  const loadMessages = async () => {
    try {
      const response = await fetch(`${CHAT_API_URL}/messages/${selectedRoom}?limit=50`, {
        headers: {
          'Authorization': user ? `Bearer ${user.token}` : ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Show demo messages if API not connected
      loadDemoMessages();
    }
  };

  // Demo messages for development
  const loadDemoMessages = () => {
    const demoMessages = [
      {
        id: 1,
        user: { name: 'AlabameFan22', favoriteTeam: 'Alabama', avatar: 'https://ui-avatars.com/api/?name=AF&background=crimson&color=fff' },
        message: 'Roll Tide! Alabama is going all the way this season! 🏈',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        room: selectedRoom
      },
      {
        id: 2,
        user: { name: 'GeorgiaDawg', favoriteTeam: 'Georgia', avatar: 'https://ui-avatars.com/api/?name=GD&background=red&color=fff' },
        message: 'Georgia defense is going to shut down Alabama this year. Go Dawgs! 🐕',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        room: selectedRoom
      },
      {
        id: 3,
        user: { name: 'TexasLonghorn', favoriteTeam: 'Texas', avatar: 'https://ui-avatars.com/api/?name=TL&background=orange&color=fff' },
        message: 'Hook em Horns! Texas is back and ready to dominate the SEC! 🤘',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        room: selectedRoom
      }
    ];
    setMessages(demoMessages);
  };

  // Join room (for real-time updates)
  const joinRoom = () => {
    // Here you would implement WebSocket connection for real-time chat
    // For now, we'll simulate with polling
    if (user) {
      setOnlineUsers(['AlabameFan22', 'GeorgiaDawg', 'TexasLonghorn', user.name]);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 1000 * 60) return 'Just now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    return date.toLocaleDateString();
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (messageFilter === 'all') return true;
    if (messageFilter === 'my-team' && user) {
      return msg.user.favoriteTeam === user.favoriteTeam;
    }
    if (messageFilter === 'predictions') {
      return msg.message.toLowerCase().includes('predict') || msg.message.toLowerCase().includes('bet');
    }
    return true;
  });

  if (!user) {
    return (
      <div className="community-chat">
        <div className="auth-required">
          <h2>🔒 Join the Community</h2>
          <p>Sign in to participate in community discussions with college sports fans!</p>
          <div className="preview-messages">
            <h3>Preview of Community Chat:</h3>
            <div className="demo-message">
              <strong>AlabameFan22:</strong> Roll Tide! Alabama is going all the way! 🏈
            </div>
            <div className="demo-message">
              <strong>GeorgiaDawg:</strong> Georgia defense will shut them down! Go Dawgs! 🐕
            </div>
            <div className="demo-message">
              <strong>TexasLonghorn:</strong> Texas is back and ready to dominate! 🤘
            </div>
          </div>
          <button className="join-community-btn">Sign In to Join Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="community-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-content">
          <h1>💬 Community Chat</h1>
          <p>Connect with college sports fans • AI-moderated for respectful discussion</p>
          
          <div className="room-selector">
            <label>Chat Room:</label>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
              {Object.entries(chatRooms).map(([key, room]) => (
                <option key={key} value={key}>
                  {room.emoji} {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="message-filter">
            <label>Show:</label>
            <select value={messageFilter} onChange={(e) => setMessageFilter(e.target.value)}>
              <option value="all">All Messages</option>
              <option value="my-team">My Team Fans</option>
              <option value="predictions">Predictions Only</option>
            </select>
          </div>
        </div>

        <div className="online-users">
          <h4>Online ({onlineUsers.length})</h4>
          <div className="users-list">
            {onlineUsers.slice(0, 5).map((username, index) => (
              <span key={index} className="online-user">{username}</span>
            ))}
            {onlineUsers.length > 5 && <span className="more-users">+{onlineUsers.length - 5} more</span>}
          </div>
        </div>
      </div>

      {/* Chat Room Info */}
      <div className="room-info">
        <div className="room-details">
          <span className="room-emoji">{chatRooms[selectedRoom].emoji}</span>
          <div>
            <h3>{chatRooms[selectedRoom].name}</h3>
            <p>{chatRooms[selectedRoom].description}</p>
          </div>
        </div>
        <div className="moderation-info">
          <span className="ai-badge">🤖 AI Moderated</span>
          <p>Trash talk welcome • Personal attacks blocked</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-avatar">
                <img src={msg.user.avatar} alt={msg.user.name} />
                <span className="team-badge">{msg.user.favoriteTeam}</span>
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="username">{msg.user.name}</span>
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  {msg.moderation?.isTrashTalk && (
                    <span className="trash-talk-badge">🔥 Trash Talk</span>
                  )}
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="message-input-form">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Share your thoughts about ${chatRooms[selectedRoom].name.toLowerCase()}...`}
            disabled={loading}
            maxLength={500}
          />
          <button type="submit" disabled={loading || !newMessage.trim()}>
            {loading ? '🤖' : '📤'}
          </button>
        </div>
        <div className="input-info">
          <span className="char-count">{newMessage.length}/500</span>
          <span className="moderation-note">
            AI monitors for respectful discussion • Friendly rivalry encouraged 🏈
          </span>
        </div>
      </form>

      {/* Chat Guidelines */}
      <div className="chat-guidelines">
        <h4>💡 Chat Guidelines</h4>
        <div className="guidelines-grid">
          <div className="guideline allowed">
            <span className="icon">✅</span>
            <div>
              <strong>Allowed:</strong>
              <p>Team boasting, rivalry banter, game predictions, stats discussion</p>
            </div>
          </div>
          <div className="guideline blocked">
            <span className="icon">❌</span>
            <div>
              <strong>Blocked:</strong>
              <p>Personal attacks, profanity, threats, harassment, off-topic content</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Moderation Status */}
      <div className="moderation-status">
        <h4>🤖 AI Moderation Active</h4>
        <p>Our AI system reviews all messages to maintain a respectful environment while allowing passionate sports discussion.</p>
        {moderationResult && (
          <div className="last-moderation">
            Last check: {moderationResult.isTrashTalk ? '🔥 Trash talk approved' : '✅ Message approved'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityChat;