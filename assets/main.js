document.addEventListener('DOMContentLoaded', function() {
  // 1. Smooth Reveal Animation using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.animate');
  animateElements.forEach(el => observer.observe(el));

  // 2. Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Calculate header offset
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 3. Navbar Scroll Effect (Glassmorphism)
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow/background on scroll
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });

  // 4. Pulse Effect for Telegram Button (Optional, if not handled by CSS animation)
  const telegramBtn = document.querySelector('.telegram-btn');
  if (telegramBtn) {
    // Add a subtle continuous pulse via CSS class instead of JS interval for better performance
    telegramBtn.classList.add('pulse-animation');
  }

  // 5. About Developer Modal
  const aboutBtn = document.getElementById('aboutDevBtn');
  const modal = document.getElementById('devModal');
  const closeBtn = document.querySelector('.close-modal');

  if (aboutBtn && modal && closeBtn) {
    aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  // 6. Chat with Rebel Gpt
  const chatBtn = document.getElementById('chatGptBtn');
  const chatModal = document.getElementById('chatModal');
  const closeChatBtn = document.querySelector('.close-chat');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendMessageBtn');
  const chatMessages = document.getElementById('chatMessages');

  // Conversation history for context
  let conversationHistory = [];

  if (chatBtn && chatModal && closeChatBtn) {
    chatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      chatModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });

    closeChatBtn.addEventListener('click', () => {
      chatModal.classList.remove('show');
      document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
      if (e.target === chatModal) {
        chatModal.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    sendBtn.disabled = true;

    // Add loading state
    const loadingId = addMessage('Thinking...', 'bot', true);

    try {
      const sceneName = 'chat_assistant';
      
      // Validate configuration
      if (!window.ywConfig?.ai_config?.[sceneName]) {
        throw new Error(`Configuration '${sceneName}' not found`);
      }

      const config = window.ywConfig.ai_config[sceneName];
      
      // Add user message to history
      conversationHistory.push({ role: 'user', content: message });

      console.log('🤖 AI API Request:', {
        model: config.model,
        scene: sceneName,
        input: message.substring(0, 100) + '...',
        parameters: {
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 1000
        }
      });

      const openai = window.aiSdk.openai.createOpenAI({
        baseURL: 'https://api.youware.com/public/v1/ai',
        apiKey: 'sk-YOUWARE'
      });

      const { text } = await window.aiSdk.ai.generateText({
        model: openai(config.model),
        messages: [
          ...(config.system_prompt ? [{ role: 'system', content: config.system_prompt }] : []),
          ...conversationHistory
        ],
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 1000
      });

      // Remove loading message
      const loadingMsg = document.getElementById(loadingId);
      if (loadingMsg) loadingMsg.remove();

      // Add AI response
      addMessage(text, 'bot');
      
      // Add AI response to history
      conversationHistory.push({ role: 'assistant', content: text });

      console.log('✅ AI API Response:', {
        model: config.model,
        outputLength: text.length,
        responsePreview: text.substring(0, 150) + '...'
      });

    } catch (error) {
      console.error('❌ API Error - Chat failed:', error);
      const loadingMsg = document.getElementById(loadingId);
      if (loadingMsg) loadingMsg.remove();
      addMessage('Error: Connection failed. Please try again.', 'bot');
    } finally {
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  function addMessage(text, sender, isLoading = false) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', `${sender}-container`);
    
    if (sender === 'bot') {
      const avatar = document.createElement('img');
      // Use the same image URL as the hero section avatar
      avatar.src = 'https://public.youware.com/users-website-assets/prod/a6330b2a-2d0c-4263-9e0e-f58a67b39c2d/3bd4f7557c4e4ed0adc20480987490fa.jpg';
      avatar.alt = 'Rebel AI';
      avatar.classList.add('message-avatar');
      messageContainer.appendChild(avatar);
    }

    const div = document.createElement('div');
    div.classList.add('message', `${sender}-message`);
    
    if (isLoading) {
      div.textContent = text;
      div.id = 'loading-' + Date.now();
    } else if (sender === 'bot') {
      // Typewriter effect for bot
      div.textContent = '';
      let i = 0;
      const speed = 20; // ms per char
      
      function typeWriter() {
        if (i < text.length) {
          div.textContent += text.charAt(i);
          i++;
          chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll while typing
          setTimeout(typeWriter, speed);
        }
      }
      // Start typing immediately
      setTimeout(typeWriter, 50);
    } else {
      div.textContent = text;
    }
    
    messageContainer.appendChild(div);
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (isLoading) return div.id;
    return null;
  }

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }
});
