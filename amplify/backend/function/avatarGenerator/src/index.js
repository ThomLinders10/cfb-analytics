// Complete Avatar Video Automation System for College Sports Predictions
// AWS Lambda function for automated video generation

const AWS = require('aws-sdk');
const axios = require('axios');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Environment variables (set in AWS Lambda)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const TABLE_NAME = process.env.TABLE_NAME || 'CFBTeamStats-dev';
const S3_BUCKET = process.env.S3_BUCKET || 'cfb-analytics-videos';

// Avatar voice IDs (configured in ElevenLabs)
const AVATAR_VOICES = {
  bob: process.env.BOB_VOICE_ID,
  tony: process.env.TONY_VOICE_ID,
  rita: process.env.RITA_VOICE_ID
};

// HeyGen avatar IDs
const HEYGEN_AVATARS = {
  bob: process.env.BOB_HEYGEN_ID,
  tony: process.env.TONY_HEYGEN_ID,
  rita: process.env.RITA_HEYGEN_ID
};

class AvatarVideoGenerator {
  constructor() {
    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    this.elevenlabsClient = axios.create({
      baseURL: 'https://api.elevenlabs.io/v1',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    this.heygenClient = axios.create({
      baseURL: 'https://api.heygen.com/v2',
      headers: {
        'X-API-KEY': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  }

  // Find next scheduled game for a team
  async findNextGame(teamName) {
    try {
      console.log(`Finding next game for ${teamName}`);
      
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Query for upcoming games where team is home or away
      const homeGamesQuery = {
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_exists(gameId) AND #gameDate > :currentDate AND (homeTeam = :teamName OR awayTeam = :teamName)',
        ExpressionAttributeNames: {
          '#gameDate': 'date'
        },
        ExpressionAttributeValues: {
          ':currentDate': currentDate,
          ':teamName': teamName
        }
      };

      const result = await dynamodb.scan(homeGamesQuery).promise();
      
      if (result.Items.length === 0) {
        console.log(`No upcoming games found for ${teamName}`);
        return null;
      }

      // Sort by date and return the next game
      const nextGame = result.Items.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      console.log(`Next game for ${teamName}: ${nextGame.homeTeam} vs ${nextGame.awayTeam} on ${nextGame.date}`);
      return nextGame;

    } catch (error) {
      console.error(`Error finding next game for ${teamName}:`, error);
      return null;
    }
  }

  // Generate homepage welcome video script (Bob & Tony)
  async generateHomepageScript() {
    const prompt = `
    Create a 45-second script for college football analysts Bob and Tony welcoming users to College Sports Predictions platform.

    Bob: Lead analyst, authoritative but friendly, ESPN GameDay style
    Tony: Stats expert, analytical but conversational, good chemistry with Bob

    Required content:
    - Welcome to College Sports Predictions
    - Mention 320,000+ data points and 54 parameters
    - Tony mentions adding basketball soon
    - Bob directs users to click "Predictions" for accuracy or "Conferences" for games
    - Natural broadcast style dialogue

    Format as JSON array with speaker and text fields.
    Keep total under 45 seconds when spoken.
    `;

    try {
      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating homepage script:', error);
      throw error;
    }
  }

  // Generate team-specific game preview script (Rita)
  async generateTeamScript(teamName, nextGame, predictionData) {
    const prompt = `
    Create a 20-30 second script for Rita, an energetic ESPN-style field reporter, previewing ${teamName}'s next game.

    Game Details:
    - ${nextGame.homeTeam} vs ${nextGame.awayTeam}
    - Date: ${nextGame.date}
    - Location: ${nextGame.location || 'TBD'}
    - Predicted Score: ${predictionData.homeScore} - ${predictionData.awayScore}

    Rita's Style:
    - Energetic field reporter
    - "Hi I'm Rita down on the field for you today"
    - Include 3 data-driven reasons supporting the prediction
    - Reference real team stats like passing yards, defensive rankings
    - Mention the predicted score naturally
    - End with excitement for the matchup

    Format as JSON with speaker: "Rita" and text field.
    Maximum 30 seconds when spoken.
    Be specific about team strengths/weaknesses that support the prediction.
    `;

    try {
      const response = await this.openaiClient.post('/chat/completions', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error generating team script:', error);
      throw error;
    }
  }

  // Generate audio using ElevenLabs
  async generateAudio(text, voiceId) {
    try {
      console.log(`Generating audio for voice ${voiceId}`);
      
      const response = await this.elevenlabsClient.post(`/text-to-speech/${voiceId}`, {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0.3
        }
      }, {
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  // Generate video using HeyGen
  async generateVideo(audioBuffer, avatarId, script) {
    try {
      console.log(`Generating video for avatar ${avatarId}`);

      // Upload audio to S3 first
      const audioKey = `temp-audio/${Date.now()}.mp3`;
      await s3.upload({
        Bucket: S3_BUCKET,
        Key: audioKey,
        Body: audioBuffer,
        ContentType: 'audio/mpeg'
      }).promise();

      const audioUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${audioKey}`;

      // Create HeyGen video
      const videoResponse = await this.heygenClient.post('/video/generate', {
        video_inputs: [{
          character: {
            type: "avatar",
            avatar_id: avatarId,
            avatar_style: "normal"
          },
          voice: {
            type: "audio",
            audio_url: audioUrl
          },
          background: {
            type: "color",
            value: "#1e3a8a" // Blue background for broadcast booth
          }
        }],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: "16:9"
      });

      // Poll for completion
      const videoId = videoResponse.data.data.video_id;
      return await this.pollVideoCompletion(videoId);

    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  // Poll HeyGen for video completion
  async pollVideoCompletion(videoId, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.heygenClient.get(`/video/${videoId}`);
        const status = response.data.data.status;

        if (status === 'completed') {
          return response.data.data.video_url;
        } else if (status === 'failed') {
          throw new Error('Video generation failed');
        }

        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
      }
    }

    throw new Error('Video generation timed out');
  }

  // Generate homepage welcome video
  async generateHomepageVideo() {
    try {
      console.log('Generating homepage welcome video...');

      // Generate script
      const script = await this.generateHomepageScript();
      
      // Generate audio for each speaker
      const audioBuffers = [];
      for (const line of script) {
        const voiceId = AVATAR_VOICES[line.speaker.toLowerCase()];
        const audio = await this.generateAudio(line.text, voiceId);
        audioBuffers.push({ speaker: line.speaker, audio, text: line.text });
      }

      // For homepage, create a composite video with Bob & Tony
      // This is simplified - in production you'd composite multiple avatars
      const combinedText = script.map(s => s.text).join(' ');
      const bobAudio = await this.generateAudio(combinedText, AVATAR_VOICES.bob);
      
      const videoUrl = await this.generateVideo(
        bobAudio,
        HEYGEN_AVATARS.bob,
        combinedText
      );

      // Save to S3
      const s3Key = 'homepage/welcome-video.mp4';
      await this.saveVideoToS3(videoUrl, s3Key);

      return {
        success: true,
        videoUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
        script: script
      };

    } catch (error) {
      console.error('Error generating homepage video:', error);
      throw error;
    }
  }

  // Generate team-specific video
  async generateTeamVideo(teamName) {
    try {
      console.log(`Generating video for ${teamName}...`);

      // Find next game
      const nextGame = await this.findNextGame(teamName);
      if (!nextGame) {
        throw new Error(`No upcoming games found for ${teamName}`);
      }

      // Get prediction data (simplified - connect to your actual prediction engine)
      const predictionData = await this.getPredictionData(nextGame);

      // Generate script
      const script = await this.generateTeamScript(teamName, nextGame, predictionData);

      // Generate audio
      const audio = await this.generateAudio(script.text, AVATAR_VOICES.rita);

      // Generate video
      const videoUrl = await this.generateVideo(
        audio,
        HEYGEN_AVATARS.rita,
        script.text
      );

      // Save to S3
      const s3Key = `teams/${teamName.replace(/\s+/g, '-').toLowerCase()}/next-game.mp4`;
      await this.saveVideoToS3(videoUrl, s3Key);

      return {
        success: true,
        videoUrl: `https://${S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
        script: script,
        nextGame: nextGame
      };

    } catch (error) {
      console.error(`Error generating video for ${teamName}:`, error);
      throw error;
    }
  }

  // Get prediction data (integrate with your actual prediction engine)
  async getPredictionData(game) {
    // This should connect to your actual prediction engine
    // For now, returning mock data
    return {
      homeScore: Math.floor(Math.random() * 20) + 20,
      awayScore: Math.floor(Math.random() * 20) + 15,
      confidence: 0.78,
      factors: [
        "Home field advantage",
        "Offensive efficiency",
        "Recent performance trends"
      ]
    };
  }

  // Save video to S3
  async saveVideoToS3(videoUrl, s3Key) {
    try {
      // Download video from HeyGen
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream'
      });

      // Upload to S3
      await s3.upload({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: videoResponse.data,
        ContentType: 'video/mp4'
      }).promise();

      console.log(`Video saved to S3: ${s3Key}`);
    } catch (error) {
      console.error('Error saving video to S3:', error);
      throw error;
    }
  }

  // Generate all team videos (batch processing)
  async generateAllTeamVideos() {
    try {
      console.log('Starting batch generation for all teams...');

      // Get all FBS teams
      const teams = await this.getAllTeams();
      const results = [];
      let processed = 0;

      // Process in batches to avoid overwhelming APIs
      const batchSize = 5;
      for (let i = 0; i < teams.length; i += batchSize) {
        const batch = teams.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (team) => {
          try {
            const result = await this.generateTeamVideo(team.name);
            processed++;
            console.log(`Progress: ${processed}/${teams.length} teams completed`);
            return { team: team.name, success: true, ...result };
          } catch (error) {
            console.error(`Failed to generate video for ${team.name}:`, error);
            return { team: team.name, success: false, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Delay between batches to respect API limits
        if (i + batchSize < teams.length) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      return results;

    } catch (error) {
      console.error('Error in batch generation:', error);
      throw error;
    }
  }

  // Get all FBS teams from database
  async getAllTeams() {
    try {
      const params = {
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_exists(school) AND dataType = :teamType',
        ExpressionAttributeValues: {
          ':teamType': 'TEAM'
        }
      };

      const result = await dynamodb.scan(params).promise();
      return result.Items.map(item => ({ name: item.school }));
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  }
}

// Lambda handler for automated video generation
exports.handler = async (event, context) => {
  const generator = new AvatarVideoGenerator();

  try {
    console.log('Avatar video generation started:', JSON.stringify(event));

    const action = event.action || 'generateAll';
    
    switch (action) {
      case 'generateHomepage':
        const homepageResult = await generator.generateHomepageVideo();
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Homepage video generated successfully',
            result: homepageResult
          })
        };

      case 'generateTeam':
        if (!event.teamName) {
          throw new Error('Team name is required for team video generation');
        }
        const teamResult = await generator.generateTeamVideo(event.teamName);
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `Team video generated successfully for ${event.teamName}`,
            result: teamResult
          })
        };

      case 'generateAll':
        // Generate homepage video
        const homepage = await generator.generateHomepageVideo();
        
        // Generate all team videos
        const allTeams = await generator.generateAllTeamVideos();
        
        const successCount = allTeams.filter(r => r.success).length;
        const failCount = allTeams.filter(r => !r.success).length;

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Batch video generation completed',
            homepage: homepage,
            teams: {
              total: allTeams.length,
              successful: successCount,
              failed: failCount,
              details: allTeams
            }
          })
        };

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Lambda execution failed:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Video generation failed',
        message: error.message,
        stack: error.stack
      })
    };
  }
};

// Utility function for manual testing
exports.testGeneration = async (teamName) => {
  const generator = new AvatarVideoGenerator();
  
  if (teamName) {
    return await generator.generateTeamVideo(teamName);
  } else {
    return await generator.generateHomepageVideo();
  }
};