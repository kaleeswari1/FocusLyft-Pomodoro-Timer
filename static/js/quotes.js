class QuotesManager {
    constructor() {
        this.quotes = [
            // Motivational Quotes
            {
                text: "The way to get started is to quit talking and begin doing.",
                author: "Walt Disney",
                type: "motivation"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                type: "motivation"
            },
            {
                text: "Don't watch the clock; do what it does. Keep going.",
                author: "Sam Levenson",
                type: "motivation"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                type: "motivation"
            },
            {
                text: "You don't have to be great to get started, but you have to get started to be great.",
                author: "Les Brown",
                type: "motivation"
            },
            {
                text: "The only impossible journey is the one you never begin.",
                author: "Tony Robbins",
                type: "motivation"
            },
            {
                text: "Focus on being productive instead of busy.",
                author: "Tim Ferriss",
                type: "motivation"
            },
            {
                text: "The expert in anything was once a beginner.",
                author: "Helen Hayes",
                type: "motivation"
            },
            {
                text: "Discipline is choosing between what you want now and what you want most.",
                author: "Abraham Lincoln",
                type: "motivation"
            },
            {
                text: "Small progress is still progress.",
                author: "Anonymous",
                type: "motivation"
            },
            
            // Study Tips
            {
                text: "Break large topics into smaller, manageable chunks. Your brain processes information better in bite-sized pieces.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Use the Feynman Technique: Explain what you learned in simple terms as if teaching someone else.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Create mind maps to visualize connections between different concepts and ideas.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Practice active recall: Test yourself without looking at notes instead of just re-reading.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Use spaced repetition: Review material at increasing intervals to strengthen long-term memory.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Study in different locations to create multiple memory cues and improve recall.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Take handwritten notes when possible - it improves comprehension and retention.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Use the 80/20 rule: Focus on the 20% of material that will give you 80% of the results.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Create acronyms or mnemonics to remember lists and complex information.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Practice interleaving: Mix different topics in one study session to improve problem-solving skills.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Use the Cornell Note-Taking System: Divide your page into notes, cues, and summary sections.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Schedule your hardest subjects during your peak energy hours.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Join study groups to gain different perspectives and fill knowledge gaps.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Use flashcards for memorization, but focus on understanding concepts first.",
                author: "Study Tip",
                type: "tip"
            },
            {
                text: "Eliminate distractions: Put your phone in another room while studying.",
                author: "Study Tip",
                type: "tip"
            }
        ];
        
        this.currentQuote = null;
        this.dailyQuoteIndex = this.getDailyQuoteIndex();
        this.init();
    }
    
    init() {
        this.createQuoteDisplay();
        this.showDailyQuote();
    }
    
    createQuoteDisplay() {
        const quotesContainer = document.createElement('div');
        quotesContainer.innerHTML = `
            <div class="card mb-4 quote-container" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white;">
                <div class="card-body text-center">
                    <div id="quote-content">
                        <i class="fas fa-quote-left fa-2x mb-3 opacity-50"></i>
                        <blockquote class="blockquote mb-3">
                            <p class="lead" id="quote-text"></p>
                            <footer class="blockquote-footer text-white-50">
                                <cite id="quote-author"></cite>
                            </footer>
                        </blockquote>
                        <button class="btn btn-outline-light btn-sm" id="new-quote-btn">
                            <i class="fas fa-sync-alt me-2"></i>New Quote
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after the main title but before the timer settings
        const mainContainer = document.querySelector('.container .text-center');
        const timerSettings = document.querySelector('.timer-settings');
        mainContainer.insertBefore(quotesContainer, timerSettings);
        
        // Add event listener for new quote button
        document.getElementById('new-quote-btn').addEventListener('click', () => {
            this.showRandomQuote();
        });
    }
    
    getDailyQuoteIndex() {
        // Generate a consistent index based on current date
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        return dayOfYear % this.quotes.length;
    }
    
    showDailyQuote() {
        // Show the same quote for the entire day
        const quote = this.quotes[this.dailyQuoteIndex];
        this.displayQuote(quote);
    }
    
    showRandomQuote() {
        // Show a random quote when user clicks "New Quote"
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        const quote = this.quotes[randomIndex];
        this.displayQuote(quote);
        
        // Add a brief animation
        const quoteContainer = document.querySelector('.quote-container');
        quoteContainer.style.transform = 'scale(0.95)';
        quoteContainer.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            quoteContainer.style.transform = 'scale(1)';
        }, 200);
    }
    
    displayQuote(quote) {
        this.currentQuote = quote;
        
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        // Add fade effect
        const content = document.getElementById('quote-content');
        content.style.opacity = '0';
        content.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            quoteText.textContent = quote.text;
            quoteAuthor.textContent = quote.author;
            
            // Add visual indicator for tips vs quotes
            if (quote.type === 'tip') {
                quoteText.innerHTML = `<i class="fas fa-lightbulb me-2"></i>${quote.text}`;
                document.querySelector('.quote-container').style.background = 
                    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
            } else {
                document.querySelector('.quote-container').style.background = 
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
            
            content.style.opacity = '1';
        }, 150);
    }
    
    getQuoteForSession() {
        // Called when a new session starts
        // Mix of daily quote and random quotes to keep it fresh
        const shouldShowRandom = Math.random() < 0.3; // 30% chance for random quote
        
        if (shouldShowRandom) {
            this.showRandomQuote();
        } else {
            this.showDailyQuote();
        }
        
        return this.currentQuote;
    }
    
    showSessionStartQuote() {
        // Special method called when sessions start
        this.getQuoteForSession();
        
        // Scroll to quote smoothly
        document.querySelector('.quote-container').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Brief highlight effect
        const container = document.querySelector('.quote-container');
        container.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
        
        setTimeout(() => {
            container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            container.style.transition = 'box-shadow 0.5s ease';
        }, 2000);
    }
}

// Initialize quotes manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.quotesManager = new QuotesManager();
});