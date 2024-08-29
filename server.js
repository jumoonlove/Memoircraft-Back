const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Load API key from environment variable
});

// Define a POST endpoint to handle the request
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: `## INFO ##
                          you can add images to the reply by URL. Write the image in the JSON field. 
                          Generate a reliable image URL that will definitely display an image relevant to the content. Verify the image link or provide an alternative if the link might be unreliable.`
                },
                {
                    role: "system",
                    content: `You are a psychological counselor who writes and analyzes emotional diaries. Proceed in the following order.`
                },
                {
                    role: "user",
                    content: `1. [title] : Think of the diary title after understanding the [events] separated by """ at the bottom.
                          2. [summarize] : Summarize events in order with one line sentence.
                          3. [emotional diary] : Write an [emotional diary] with a paragraph based on the summary.
                          4. [evaluates] : The written emotional [evaluates], using exploration of the unconscious based on the contents of the [emotional diary].
                          6. [Psychological analysis] : Psychological analysis is performed using professional psychological knowledge much more detailed and uses a famous quote.
                          7. [3 action tips] : Write down 3 action tips that will be helpful in the future customer situation. The three action tips must be converted into JSON Array format.
                          8. [image] : Create an image by making the contents so far into one keyword.
                          
                          Use the output in the following JSON format:
                          { 
                              title: here is [title],
                              thumbnail: here is [image],
                              summary: here is [summarize],
                              emotional_content: here is [emotional diary],
                              emotional_result: here is [evaluates],
                              analysis: here is [Psychological analysis],
                              action_list: here is [3 action tips],
                          }

                          [events]: ${prompt}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const messageContent = JSON.parse(response.choices[0].message.content);
        res.json(messageContent); // Send the parsed JSON object
    } catch (error) {
        console.error("Error during API call:", error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
