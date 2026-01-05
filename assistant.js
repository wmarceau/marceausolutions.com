/**
 * Fitness Influencer AI Assistant - Chat Interface
 * Intelligent routing of natural language requests to backend API endpoints
 */

const API_URL = 'https://web-production-44ade.up.railway.app';

// Track conversation state
let conversationHistory = [];

/**
 * Process user request with intelligent routing
 * Analyzes the request and routes to appropriate backend endpoints
 */
async function processUserRequest(message, files) {
    const typingIndicator = document.getElementById('typingIndicator');

    try {
        // Analyze request intent
        const intent = analyzeIntent(message, files);

        // Route to appropriate handler
        let response;
        switch (intent.type) {
            case 'video_edit':
                response = await handleVideoEdit(message, files, intent);
                break;
            case 'create_graphic':
                response = await handleGraphicCreation(message, files, intent);
                break;
            case 'generate_image':
                response = await handleImageGeneration(message, intent);
                break;
            case 'email_digest':
                response = await handleEmailDigest(message, intent);
                break;
            case 'revenue_analytics':
                response = await handleRevenueAnalytics(message, intent);
                break;
            case 'calendar_reminder':
                response = await handleCalendarReminder(message, intent);
                break;
            case 'create_ad':
                response = await handleAdCreation(message, files, intent);
                break;
            default:
                response = handleGeneralQuery(message);
        }

        // Hide typing indicator
        typingIndicator.classList.remove('active');

        // Add response to chat
        addMessage(response, 'assistant');

        // Clear attached files after processing
        window.attachedFiles = [];
        displayAttachedFiles();

    } catch (error) {
        typingIndicator.classList.remove('active');
        addMessage(`Sorry, I encountered an error: ${error.message}. Please try again or rephrase your request.`, 'assistant');
    }
}

/**
 * Analyze user intent from message and files
 */
function analyzeIntent(message, files) {
    const lowerMessage = message.toLowerCase();

    // Check for video editing
    if ((lowerMessage.includes('edit') || lowerMessage.includes('jump cut') || lowerMessage.includes('remove silence')) && files.some(f => f.type.startsWith('video/'))) {
        return { type: 'video_edit', confidence: 'high' };
    }

    // Check for ad creation
    if (lowerMessage.includes('ad') || lowerMessage.includes('advertisement') || lowerMessage.includes('promotional video')) {
        return { type: 'create_ad', confidence: 'high' };
    }

    // Check for graphic creation
    if (lowerMessage.includes('graphic') || lowerMessage.includes('instagram post') || lowerMessage.includes('create image') || lowerMessage.match(/tips|guide|infographic/)) {
        return { type: 'create_graphic', confidence: 'high' };
    }

    // Check for AI image generation
    if (lowerMessage.includes('generate') && (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('ai'))) {
        return { type: 'generate_image', confidence: 'high' };
    }

    // Check for email digest
    if (lowerMessage.includes('email') && (lowerMessage.includes('digest') || lowerMessage.includes('summary') || lowerMessage.includes('inbox'))) {
        return { type: 'email_digest', confidence: 'high' };
    }

    // Check for revenue analytics
    if (lowerMessage.match(/revenue|analytics|profit|expense|income/)) {
        return { type: 'revenue_analytics', confidence: 'high' };
    }

    // Check for calendar reminders
    if (lowerMessage.match(/calendar|reminder|schedule|recurring/)) {
        return { type: 'calendar_reminder', confidence: 'high' };
    }

    return { type: 'general', confidence: 'low' };
}

/**
 * Handle video editing request
 */
async function handleVideoEdit(message, files, intent) {
    const videoFile = files.find(f => f.type.startsWith('video/'));

    if (!videoFile) {
        return "I'd be happy to edit your video! Please attach a video file (MP4, MOV, or AVI) and I'll remove the silence with jump cuts.";
    }

    // Extract silence threshold from message if specified
    const thresholdMatch = message.match(/-?\d+\s*db/i);
    const silenceThreshold = thresholdMatch ? parseInt(thresholdMatch[0]) : -40;

    // Create FormData
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('silence_threshold', silenceThreshold);
    formData.append('min_silence_duration', '0.5');

    addMessage(`Processing "${videoFile.name}"... This may take a few minutes depending on video length.`, 'assistant');

    try {
        const response = await fetch(`${API_URL}/api/video/edit`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return `
                ✅ Video processed successfully!<br><br>
                <strong>📊 Processing Stats:</strong><br>
                • Original Size: ${data.stats.original_size_mb}MB<br>
                • Processed Size: ${data.stats.processed_size_mb}MB<br>
                • Size Reduction: ${data.stats.size_reduction_percent}%<br>
                • Jump Cuts Made: ${data.stats.cuts_made}<br>
                • Processing Time: ${data.stats.processing_time_seconds}s<br>
                • Silence Threshold: ${data.stats.silence_threshold_db}dB<br><br>
                <a href="${data.output_url}" class="btn btn-gold" download="edited_${videoFile.name}">⬇️ Download Edited Video</a>
            `;
        } else {
            throw new Error(data.message || 'Processing failed');
        }
    } catch (error) {
        throw new Error(`Video processing failed: ${error.message}`);
    }
}

/**
 * Handle graphic creation request
 */
async function handleGraphicCreation(message, files, intent) {
    // Extract title and points from message
    const titleMatch = message.match(/["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : message.split(' ').slice(0, 5).join(' ');

    // Look for numbered lists or bullet points
    const points = message.match(/\d+\.\s+([^\n]+)/g) ||
                   message.match(/[-•]\s+([^\n]+)/g) ||
                   ['Tip 1', 'Tip 2', 'Tip 3'];

    const cleanPoints = points.map(p => p.replace(/^\d+\.\s+|^[-•]\s+/, '').trim()).slice(0, 5);

    return `
        🎨 Creating branded graphic with:<br>
        <strong>Title:</strong> "${title}"<br>
        <strong>Points:</strong><br>
        ${cleanPoints.map(p => `• ${p}`).join('<br>')}<br><br>
        <em>Note: Graphic creation endpoint coming soon! This will generate Instagram/YouTube-ready graphics with your branding.</em>
    `;
}

/**
 * Handle AI image generation request
 */
async function handleImageGeneration(message, intent) {
    // Extract prompt from message
    const prompt = message.replace(/generate|create|make|ai|image|picture/gi, '').trim();

    return `
        🖼️ Generating AI image with prompt:<br>
        "${prompt}"<br><br>
        <em>Note: AI image generation endpoint coming soon! This will use Grok/xAI to create custom images.</em><br><br>
        Estimated cost: $0.07 per image
    `;
}

/**
 * Handle email digest request
 */
async function handleEmailDigest(message, intent) {
    // Extract timeframe from message
    const daysMatch = message.match(/(\d+)\s*(day|week|hour)/i);
    let hours = 24;

    if (daysMatch) {
        const num = parseInt(daysMatch[1]);
        const unit = daysMatch[2].toLowerCase();

        if (unit.startsWith('week')) {
            hours = num * 24 * 7;
        } else if (unit.startsWith('day')) {
            hours = num * 24;
        } else {
            hours = num;
        }
    }

    return `
        📧 Generating email digest for the past ${hours} hours...<br><br>
        <em>Note: Email digest endpoint requires Google OAuth setup. This will categorize your emails by priority and provide suggested actions.</em><br><br>
        <strong>Categories:</strong><br>
        • Urgent Client Emails<br>
        • Business Development<br>
        • Partnership Opportunities<br>
        • General Correspondence
    `;
}

/**
 * Handle revenue analytics request
 */
async function handleRevenueAnalytics(message, intent) {
    return `
        📊 Generating revenue analytics report...<br><br>
        <em>Note: Revenue analytics requires connection to your Google Sheets. This will analyze:</em><br><br>
        • Revenue by source (coaching, products, sponsorships)<br>
        • Expenses by category<br>
        • Profit margins<br>
        • Month-over-month growth<br>
        • Top performing revenue streams<br><br>
        Please provide your Google Sheets ID to get started.
    `;
}

/**
 * Handle calendar reminder request
 */
async function handleCalendarReminder(message, intent) {
    // Extract days from message
    const dayPatterns = {
        'monday': 'MO', 'mon': 'MO',
        'tuesday': 'TU', 'tue': 'TU',
        'wednesday': 'WE', 'wed': 'WE',
        'thursday': 'TH', 'thu': 'TH',
        'friday': 'FR', 'fri': 'FR',
        'saturday': 'SA', 'sat': 'SA',
        'sunday': 'SU', 'sun': 'SU'
    };

    const lowerMsg = message.toLowerCase();
    const days = [];

    for (const [day, code] of Object.entries(dayPatterns)) {
        if (lowerMsg.includes(day)) {
            days.push(code);
        }
    }

    const daysList = days.length > 0 ? days.join(', ') : 'MO, WE, FR';

    return `
        📅 Creating recurring calendar reminder:<br>
        <strong>Days:</strong> ${daysList}<br>
        <strong>Task:</strong> ${message.split('for')[1] || 'Content posting'}<br><br>
        <em>Note: Calendar integration requires Google OAuth setup. This will create recurring reminders in your Google Calendar.</em>
    `;
}

/**
 * Handle advertisement creation request
 */
async function handleAdCreation(message, files, intent) {
    const hasVideo = files.some(f => f.type.startsWith('video/'));
    const hasImages = files.some(f => f.type.startsWith('image/'));

    let assetInfo = '';
    if (hasVideo) assetInfo += '• Video footage<br>';
    if (hasImages) assetInfo += `• ${files.filter(f => f.type.startsWith('image/')).length} image(s)<br>`;

    // If they have a video, suggest editing it first
    if (hasVideo) {
        return `
            🎬 I see you want to create an ad with video footage!<br><br>
            <strong>Here's how I can help RIGHT NOW:</strong><br><br>
            <strong>✅ Step 1: Video Editing (Available Now!)</strong><br>
            I can edit your video with automatic jump cuts to remove silence and awkward pauses. Just say:<br>
            • "Edit this video with jump cuts"<br>
            • "Remove all silence from this video"<br><br>
            <strong>⏳ Full Ad Creation Workflow (Coming Soon):</strong><br>
            Eventually I'll be able to combine multiple assets, add graphics, music, and export platform-optimized versions automatically.<br><br>
            <strong>For now:</strong> Let me edit your video first, then you can add graphics/text with other tools!
        `;
    }

    return `
        🎬 I can help create marketing content!<br><br>
        <strong>Assets provided:</strong><br>
        ${assetInfo || '• None (text-only request)'}<br><br>
        <strong>What I can do RIGHT NOW:</strong><br>
        • <strong>Video Editing:</strong> Upload a video and say "edit this with jump cuts"<br>
        • <strong>Graphics:</strong> Request branded graphics (coming soon)<br>
        • <strong>AI Images:</strong> Generate backgrounds (coming soon)<br><br>
        <strong>⏳ Full Ad Creation:</strong><br>
        The complete ad workflow (combining video, graphics, music into a polished 30-60 second ad) is coming soon!<br><br>
        <strong>Best approach for now:</strong><br>
        1. Upload your video<br>
        2. Say "edit this with jump cuts"<br>
        3. Download the edited version<br>
        4. Add text/graphics with Canva or similar tools
    `;
}

/**
 * Handle general queries
 */
function handleGeneralQuery(message) {
    return `
        I can help you with:<br><br>
        <strong>🎬 Content Creation:</strong><br>
        • Edit videos with jump cuts<br>
        • Create branded graphics<br>
        • Generate AI images<br>
        • Make video advertisements<br><br>
        <strong>📊 Business Operations:</strong><br>
        • Email digests and summaries<br>
        • Revenue & expense analytics<br>
        • Calendar reminders<br><br>
        Try uploading a video and saying "edit this with jump cuts" or click the capability cards above to see example prompts!
    `;
}

/**
 * Check API status
 */
async function checkAPIStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('status-text');

    try {
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();

        if (data.ready) {
            statusIndicator.classList.add('status-online');
            statusIndicator.classList.remove('status-offline');
            statusText.textContent = 'System Ready';
            statusText.className = 'text-success';
        } else {
            statusIndicator.classList.add('status-online');
            statusText.textContent = 'System Online (Some features unavailable)';
            statusText.className = 'text-warning';
        }
    } catch (error) {
        statusIndicator.classList.remove('status-online');
        statusIndicator.classList.add('status-offline');
        statusText.textContent = 'System Offline';
        statusText.className = 'text-danger';
    }
}
