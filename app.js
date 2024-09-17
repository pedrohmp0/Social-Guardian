new Vue({
    el: '#app',
    data: {
        messages: [],
        inputMessage: '',
        loading: false, 
        showButtons: false,
        showFeedback: false,
        feedback: '',
        showOptionsMenu: false,
        askingForName: true,
        askingForQuestionnaire: false,
        askingToContinueConversation: false,
        currentQuestionIndex: 0,
        questions: [
            "Como você está se sentindo hoje?",
            "Você tem tido dificuldades para dormir?",
            "Tem sentido falta de interesse em atividades que antes gostava?",
            "Como tem sido sua alimentação recentemente?",
            "Você tem se sentido ansioso ou deprimido com frequência?"
        ],
        options: [
            ["Muito bem", "Mais ou menos", "Mal"],
            ["Sim, frequentemente", "Às vezes", "Não"],
            ["Sim, perdi o interesse", "Não, continuo interessado", "Mais ou menos"],
            ["Tenho me alimentado bem", "Minha alimentação tem sido irregular", "Não tenho comido muito"],
            ["Sim, frequentemente", "Às vezes", "Não, raramente"]
        ],
        currentOptions: [],
        userResponses: [],
        userName: '',
        questionnaireOptions: ["Sim", "Não"], 
        continueConversationOptions: ["Sim", "Não"] 
    },
    mounted() {
        this.sendInitialMessage();
    },
    methods: {
        async sendMessage() {
            if (this.inputMessage.trim() === '') return;

            this.messages.push({ text: this.inputMessage, type: 'user' });
            this.loading = true; 

            if (this.askingForName) {
                this.userName = this.inputMessage;
                this.askingForName = false;
                this.inputMessage = '';
                this.messages.push({ text: `Obrigado, ${this.userName}. Você deseja responder um questionário para ajudar na sua saúde mental?`, type: 'bot' });
                this.askingForQuestionnaire = true;
                this.showButtons = true; 
                this.currentOptions = this.questionnaireOptions;
                this.$nextTick(() => {
                    this.scrollToEnd();
                });
                this.loading = false; 
                return;
            }

            this.userResponses.push(this.inputMessage);

            const userMessage = this.inputMessage;
            this.inputMessage = '';
            this.$nextTick(() => {
                this.scrollToEnd();
            });

            try {
                const response = await this.getBotResponse(userMessage);
                this.messages.push({ text: response, type: 'bot' });
                this.$nextTick(() => {
                    this.scrollToEnd();
                });
            } catch (error) {
                console.error('Error:', error);
            } finally {
                this.loading = false; 
            }
        },
        
        downloadConversation() {
            const conversationText = this.messages.map(message => {
                return `${message.type === 'bot' ? 'Bot' : 'Você'}: ${message.text}`;
            }).join('\n\n');

            const blob = new Blob([conversationText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'chat-SocialGuardian.txt';
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        sendInitialMessage() {
            this.messages.push({ text: "Olá! Qual é o seu nome?", type: 'bot' });
            this.$nextTick(() => {
                this.scrollToEnd();
            });
        },
        sendInitialQuestionnaire() {
            this.shuffleQuestions();
            this.messages.push({ text: this.questions[this.currentQuestionIndex], type: 'bot' });
            this.currentOptions = this.options[this.currentQuestionIndex];
            this.showButtons = true;
            this.$nextTick(() => {
                this.scrollToEnd();
            });
        },
        handleOptionClick(option) {
            this.messages.push({ text: option, type: 'user' });
            this.userResponses.push(option);

            if (this.askingForQuestionnaire) {
                this.askingForQuestionnaire = false;
                this.showButtons = false; 
                if (option.toLowerCase() === 'sim') {
                    this.sendInitialQuestionnaire();
                } else {
                    this.messages.push({ text: "Se precisar de ajuda em outro momento, estarei aqui.", type: 'bot' });
                    this.$nextTick(() => {
                        this.scrollToEnd();
                    });
                }
                return;
            }

            if (this.askingToContinueConversation) {
                this.askingToContinueConversation = false;
                this.showButtons = false; 
                if (option.toLowerCase() === 'sim') {
                    this.messages.push({ text: "Estou aqui para ajudar. Sobre o que você gostaria de conversar?", type: 'bot' });
                } else {
                    this.messages.push({ text: "Tudo bem! Se precisar de mim, estarei aqui.", type: 'bot' });
                }
                this.$nextTick(() => {
                    this.scrollToEnd();
                });
                return;
            }

            this.currentQuestionIndex++;

            if (this.currentQuestionIndex < this.questions.length) {
                this.messages.push({ text: this.questions[this.currentQuestionIndex], type: 'bot' });
                this.currentOptions = this.options[this.currentQuestionIndex];
            } else {
                this.showButtons = false;
                this.getFinalRecommendation();
            }

            this.$nextTick(() => {
                this.scrollToEnd();
            });
        },
        scrollToEnd() {
            const messagesContainer = this.$refs.messages;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },
        async getBotResponse(message) {
            const apiKey = 'api key'; // Substitua com sua chave da API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'Seu nome é Social Guardian. Você é um assistente que responde em português e ajuda os usuários a identificar sinais de problemas psicológicos e mentais.' },
                        { role: 'user', content: message }
                    ],
                }),
            });

            const data = await response.json();
            return data.choices[0].message.content.trim();
        },
        async getFinalRecommendation() {
            this.loading = true; 
            try {
                const apiKey = 'api key'; // Substitua com sua chave da API
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'Você é um assistente em português que faz recomendações de profissões médicas baseadas nas respostas dos usuários a um questionário sobre saúde mental. Responda e paragrafos quando se referir e diferentes médicos com tópicos.' },
                            { role: 'user', content: `Usuário respondeu: ${this.userResponses.join(', ')}` }
                        ],
                    }),
                });

                const data = await response.json();
                const recommendations = data.choices[0].message.content.trim();
                this.messages.push({ text: `Recomendamos que você procure os seguintes profissionais de saúde: ${recommendations}`, type: 'bot' });
                this.messages.push({ text: `Se precisar de ajuda com mais alguma coisa, ${this.userName}, estou aqui. Gostaria de conversar?`, type: 'bot' });
                this.askingToContinueConversation = true; 
                this.showButtons = true; 
                this.currentOptions = this.continueConversationOptions;
                this.$nextTick(() => {
                    this.scrollToEnd();
                });
            } catch (error) {
                console.error('Error:', error);
            } finally {
                this.loading = false; 
            }
        },
        restartChat() {
            this.messages = [];
            this.showButtons = false;
            this.currentQuestionIndex = 0;
            this.userResponses = [];
            this.askingForName = true;
            this.askingForQuestionnaire = false;
            this.askingToContinueConversation = false; 
            this.sendInitialMessage();
        },
        toggleOptionsMenu() {
            this.showOptionsMenu = !this.showOptionsMenu;
            console.log('Options menu toggled:', this.showOptionsMenu); 
        },
        shuffleQuestions() {
            for (let i = this.questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
                [this.options[i], this.options[j]] = [this.options[j], this.options[i]];
            }
        }
    }
});
