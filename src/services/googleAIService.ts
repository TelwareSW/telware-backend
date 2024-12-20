const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HF_API_KEY);

const modelName = 'unitary/toxic-bert';

export async function detectInappropriateContent(text: string): Promise<boolean> {
    try {
        const response = await hf.textClassification({
            model: modelName,
            inputs: text,
        });

        console.log('Model Response:', JSON.stringify(response, null, 2));

        const relevantLabels = ['toxic', 'obscene', 'insult', 'severe_toxic'];
        const threshold = 0.7;

        interface TextClassificationResult {
            label: string;
            score: number;
        }

        const toxicityScore = (response as TextClassificationResult[])
            .filter((result) => relevantLabels.includes(result.label.toLowerCase()) && result.score > threshold)
            .reduce((acc, curr) => acc + curr.score, 0);

        console.log(`Total Toxicity Score: ${toxicityScore}`);

        return toxicityScore < threshold;
    } catch (error) {
        console.error('Error detecting inappropriate content:', error);
        throw new Error('Failed to detect inappropriate content');
    }
}