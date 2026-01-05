// API Configuration
const API_BASE_URL = 'https://web-production-44ade.up.railway.app';

// Check API status on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAPIStatus();
});

// Check if API is online
async function checkAPIStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('status-text');

    try {
        const response = await fetch(`${API_BASE_URL}/api/status`);
        const data = await response.json();

        if (data.api_status === 'healthy') {
            statusIndicator.classList.remove('status-offline');
            statusIndicator.classList.add('status-online');
            statusText.textContent = 'API Connected ✓';
            statusText.style.color = '#00ff00';
        } else {
            throw new Error('API unhealthy');
        }
    } catch (error) {
        statusIndicator.classList.remove('status-online');
        statusIndicator.classList.add('status-offline');
        statusText.textContent = 'API Offline ✗';
        statusText.style.color = '#ff0000';
        console.error('API Status Check Failed:', error);
    }
}

// Video Processing
async function processVideo() {
    const videoUrl = document.getElementById('videoUrl').value;
    const outputDiv = document.getElementById('video-output');

    if (!videoUrl) {
        alert('Please enter a video URL');
        return;
    }

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = '<div class="spinner-border text-warning" role="status"></div> Processing video...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/video/edit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_url: videoUrl,
                silence_threshold: -40,
                min_silence_duration: 0.5
            })
        });

        const data = await response.json();

        if (response.ok) {
            outputDiv.innerHTML = `
                <div class="text-success">✓ Video processed successfully!</div>
                <div class="mt-2">
                    <strong>Output:</strong> ${data.output_path || 'Ready for download'}
                </div>
                ${data.cuts_made ? `<div><strong>Cuts made:</strong> ${data.cuts_made}</div>` : ''}
            `;
        } else {
            throw new Error(data.detail || 'Processing failed');
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="text-danger">✗ Error: ${error.message}</div>`;
    }
}

// Create Educational Graphic
async function createGraphic() {
    const mainText = document.getElementById('graphicText').value;
    const subtext = document.getElementById('graphicSubtext').value;
    const outputDiv = document.getElementById('graphic-output');

    if (!mainText) {
        alert('Please enter main text for the graphic');
        return;
    }

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = '<div class="spinner-border text-warning" role="status"></div> Creating graphic...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/graphics/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                main_text: mainText,
                subtext: subtext,
                template: 'motivation'
            })
        });

        const data = await response.json();

        if (response.ok) {
            outputDiv.innerHTML = `
                <div class="text-success">✓ Graphic created successfully!</div>
                <div class="mt-2">
                    <strong>File:</strong> ${data.output_path || 'Ready for download'}
                </div>
                ${data.image_url ? `<img src="${data.image_url}" alt="Generated graphic" class="img-fluid mt-3" style="max-height: 300px;">` : ''}
            `;
        } else {
            throw new Error(data.detail || 'Creation failed');
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="text-danger">✗ Error: ${error.message}</div>`;
    }
}

// Get Email Digest
async function getEmailDigest() {
    const days = document.getElementById('emailDays').value;
    const outputDiv = document.getElementById('email-output');

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = '<div class="spinner-border text-warning" role="status"></div> Fetching emails...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/email/digest?days=${days}`);
        const data = await response.json();

        if (response.ok) {
            let emailsHTML = '<div class="text-success">✓ Digest retrieved!</div>';

            if (data.categories) {
                Object.keys(data.categories).forEach(category => {
                    const emails = data.categories[category];
                    if (emails.length > 0) {
                        emailsHTML += `
                            <div class="mt-3">
                                <strong class="text-warning">${category.toUpperCase()}</strong> (${emails.length})
                                <ul class="mt-2">
                                    ${emails.slice(0, 5).map(email => `<li>${email.subject || email}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                    }
                });
            } else {
                emailsHTML += `<div class="mt-2">Total emails: ${data.total || 0}</div>`;
            }

            outputDiv.innerHTML = emailsHTML;
        } else {
            throw new Error(data.detail || 'Failed to fetch emails');
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="text-danger">✗ Error: ${error.message}</div>`;
    }
}

// Get Revenue Analytics
async function getAnalytics() {
    const sheetId = document.getElementById('sheetId').value;
    const outputDiv = document.getElementById('analytics-output');

    if (!sheetId) {
        alert('Please enter a Google Sheet ID');
        return;
    }

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = '<div class="spinner-border text-warning" role="status"></div> Analyzing revenue...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/revenue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sheet_id: sheetId
            })
        });

        const data = await response.json();

        if (response.ok) {
            outputDiv.innerHTML = `
                <div class="text-success">✓ Analytics generated!</div>
                <div class="mt-2">
                    ${data.total_revenue ? `<div><strong>Total Revenue:</strong> $${data.total_revenue.toFixed(2)}</div>` : ''}
                    ${data.total_expenses ? `<div><strong>Total Expenses:</strong> $${data.total_expenses.toFixed(2)}</div>` : ''}
                    ${data.profit ? `<div><strong>Profit:</strong> $${data.profit.toFixed(2)}</div>` : ''}
                    ${data.profit_margin ? `<div><strong>Profit Margin:</strong> ${(data.profit_margin * 100).toFixed(1)}%</div>` : ''}
                </div>
            `;
        } else {
            throw new Error(data.detail || 'Analytics failed');
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="text-danger">✗ Error: ${error.message}</div>`;
    }
}

// Generate AI Image
async function generateImage() {
    const prompt = document.getElementById('imagePrompt').value;
    const outputDiv = document.getElementById('image-output');

    if (!prompt) {
        alert('Please enter an image prompt');
        return;
    }

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = '<div class="spinner-border text-warning" role="status"></div> Generating image (this may take 30-60 seconds)...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/images/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                style: 'realistic'
            })
        });

        const data = await response.json();

        if (response.ok) {
            outputDiv.innerHTML = `
                <div class="text-success">✓ Image generated!</div>
                ${data.image_url ? `
                    <div class="mt-3">
                        <img src="${data.image_url}" alt="AI Generated Image" class="img-fluid" style="max-height: 400px; border-radius: 8px;">
                    </div>
                ` : ''}
                ${data.image_path ? `<div class="mt-2"><small>Saved to: ${data.image_path}</small></div>` : ''}
            `;
        } else {
            throw new Error(data.detail || 'Image generation failed');
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="text-danger">✗ Error: ${error.message}</div>`;
    }
}

// Create Calendar Reminder
async function createReminder() {
    const title = document.getElementById('reminderTitle').value;
    const days = document.getElementById('reminderDays').value;
    const outputDiv = document.getElementById('calendar-output');

    if (!title) {
        alert('Please enter a reminder title');
        return;
    }

    outputDiv.style.display = 'block';
    outputDiv.innerHTML = '<div class="spinner-border text-warning" role="status"></div> Creating reminder...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/calendar/reminder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                days: days.split(',').map(d => d.trim()),
                time: '09:00'
            })
        });

        const data = await response.json();

        if (response.ok) {
            outputDiv.innerHTML = `
                <div class="text-success">✓ Reminder created successfully!</div>
                <div class="mt-2">
                    <strong>Title:</strong> ${title}<br>
                    <strong>Days:</strong> ${days}<br>
                    ${data.event_link ? `<a href="${data.event_link}" target="_blank" class="text-gold">View in Google Calendar</a>` : ''}
                </div>
            `;
        } else {
            throw new Error(data.detail || 'Reminder creation failed');
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="text-danger">✗ Error: ${error.message}</div>`;
    }
}
