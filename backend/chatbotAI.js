const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const { createClient } = require('@supabase/supabase-js');

class ChatbotAI {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.vocabulary = new Set();
    this.responses = [];
    this.model = null;
  }

  // Metni temizle ve tokenize et
  preprocessText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  // Kelime vektörü oluştur
  createWordVector(text) {
    const tokens = this.preprocessText(text);
    const vector = new Array(this.vocabulary.size).fill(0);
    
    tokens.forEach(token => {
      if (this.vocabulary.has(token)) {
        const index = Array.from(this.vocabulary).indexOf(token);
        vector[index] = 1;
      }
    });
    
    return vector;
  }

  // Neural Network modelini oluştur
  createModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [this.vocabulary.size],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout(0.2),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout(0.2),
        tf.layers.dense({
          units: this.responses.length,
          activation: 'softmax'
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  // Veriyi yükle ve modeli eğit
  async loadDataAndTrain() {
    try {
      console.log('Supabase\'dan veri yükleniyor...');
      
      const { data, error } = await this.supabase
        .from('chatbot_responses')
        .select('question, answer, keywords');
      
      if (error) {
        console.error('Veri yükleme hatası:', error);
        return false;
      }

      this.responses = data;
      console.log(`${data.length} adet soru-cevap yüklendi`);

      // Kelime dağarcığını oluştur
      data.forEach(item => {
        const tokens = this.preprocessText(item.question);
        tokens.forEach(token => this.vocabulary.add(token));
        
        if (item.keywords) {
          item.keywords.forEach(keyword => {
            this.vocabulary.add(keyword.toLowerCase());
          });
        }
      });

      console.log(`Kelime dağarcığı boyutu: ${this.vocabulary.size}`);

      // Eğitim verisi oluştur
      const trainingData = [];
      const labels = [];

      data.forEach((item, index) => {
        const vector = this.createWordVector(item.question);
        trainingData.push(vector);
        
        const label = new Array(data.length).fill(0);
        label[index] = 1;
        labels.push(label);
      });

      // Model oluştur ve eğit
      this.createModel();
      
      const xs = tf.tensor2d(trainingData);
      const ys = tf.tensor2d(labels);

      console.log('Model eğitiliyor...');
      await this.model.fit(xs, ys, {
        epochs: 100,
        batchSize: 8,
        validationSplit: 0.2,
        verbose: 0
      });

      xs.dispose();
      ys.dispose();
      
      console.log('Model eğitimi tamamlandı!');
      return true;
    } catch (error) {
      console.error('Eğitim hatası:', error);
      return false;
    }
  }

  // Soruya cevap ver
  async getResponse(question) {
    try {
      if (!this.model) {
        return { answer: 'Model henüz hazır değil.', confidence: 0 };
      }

      const inputVector = this.createWordVector(question);
      const inputTensor = tf.tensor2d([inputVector]);
      
      const prediction = this.model.predict(inputTensor);
      const probabilities = await prediction.array();
      
      inputTensor.dispose();
      prediction.dispose();

      const maxIndex = probabilities[0].indexOf(Math.max(...probabilities[0]));
      const confidence = probabilities[0][maxIndex];

      if (confidence > 0.3) {
        return {
          answer: this.responses[maxIndex].answer,
          confidence: confidence
        };
      } else {
        // Düşük güven skoru için fallback
        return {
          answer: 'Üzgünüm, bu soruya tam olarak cevap veremiyorum. Daha spesifik sorabilir misiniz?',
          confidence: confidence
        };
      }
    } catch (error) {
      console.error('Cevap verme hatası:', error);
      return {
        answer: 'Bir hata oluştu, lütfen tekrar deneyin.',
        confidence: 0
      };
    }
  }
}

module.exports = ChatbotAI; 