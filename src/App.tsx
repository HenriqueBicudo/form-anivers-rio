import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import './App.css'

// URL do Google Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-MZrNd63RtdYK_xXmmA0eYJAakpKxMNAYWQJX6Tq87ZGGb_hgHSrVR03lNeN81FzF/exec';

interface FormData {
  nome: string;
  acompanhante: string;
  chopp: string;
  comida: string;
}

const NOMES = [
  'Arthur', 'Vinicius', 'Douglas', 'Nicolas', 'Enzo', 
  'Henrique', 'Maria', 'Jaum', 'Millena', 'Laiza'
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    acompanhante: '',
    chopp: '',
    comida: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [cursor, setCursor] = useState('default');
  const [beerAnimation, setBeerAnimation] = useState<'none' | 'filling-double' | 'filling-single'>('none');
  const { width, height } = useWindowSize();

  // Função para gerar confetes profissionais
  const generateConfetti = () => {
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Som de pop
  const playPopSound = () => {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSYFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsPDjiS2/K8ey4FG3vK8N2/VgYObKzq8qF/GRIVe9bz1m0fFDQ7ndTy6kUVCVWn6O22ZRURbL3y8qGHGhMVe9bt1m0fGTQ7ntTy6kUVCVWn6O22ZRURbL3y8qGHGhMVe9bt1m0fGTQ7ntTy6kUVCVWn6O22ZRQSar3z8Z6DHBIUeNXt2W0fGTQ7ndTy';
    audio.play().catch(() => {});
  };

  // Função para selecionar nome
  const selectName = (nome: string) => {
    console.log('Nome selecionado:', nome); // Debug
    // Adiciona classe de animação de estouro
    const clickedBalloon = document.querySelector(`[data-name="${nome}"]`) as HTMLElement;
    if (clickedBalloon) {
      clickedBalloon.classList.add('popping');
    }
    
    playPopSound();
    generateConfetti();
    setFormData(prev => {
      const newData = {...prev, nome};
      console.log('FormData atualizado:', newData); // Debug
      return newData;
    });
    
    setTimeout(() => {
      setCurrentStep(1);
    }, 800);
  };

  // Função para selecionar companhia
  const selectCompanhia = (acompanhante: string) => {
    console.log('Acompanhante selecionado:', acompanhante); // Debug
    setFormData(prev => {
      const newData = {...prev, acompanhante};
      console.log('FormData atualizado:', newData); // Debug
      return newData;
    });
    
    if (acompanhante === 'sozinho') {
      setCursor('😢');
    } else {
      setCursor('default');
    }
    
    setTimeout(() => {
      setCurrentStep(2);
    }, 1000);
  };

  // Função para selecionar chope
  const selectChope = (chopp: string) => {
    console.log('Chopp selecionado:', chopp); // Debug
    setFormData(prev => {
      const newData = {...prev, chopp};
      console.log('FormData atualizado:', newData); // Debug
      return newData;
    });
    
    if (chopp === 'rachar') {
      setBeerAnimation('filling-double');
    } else {
      setBeerAnimation('filling-single');
    }
    
    setTimeout(() => {
      setBeerAnimation('none');
      setCurrentStep(3);
    }, 2000);
  };

  // Função para selecionar restrições
  const selectRestricoes = (comida: string) => {
    console.log('Comida selecionada:', comida); // Debug
    const finalData = {...formData, comida};
    console.log('Dados finais para envio:', finalData); // Debug
    setFormData(prev => ({...prev, comida}));
    submitForm(finalData);
  };

  // Função para enviar formulário
  const submitForm = async (data: FormData) => {
    console.log('Enviando dados:', data); // Debug
    setSubmitStatus('Enviando...');
    
    try {
      // Envia exatamente como o JavaScript original (JSON)
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status); // Debug
      
      // Tenta ler a resposta (pode falhar com no-cors, mas vamos tentar)
      let result;
      try {
        result = await response.json();
        console.log('Response JSON:', result); // Debug
      } catch {
        // Se não conseguir ler JSON, assume sucesso se não houve erro de rede
        result = { result: 'success' };
      }
      
      if (result.result === 'success') {
        setSubmitStatus('🎉 Dados enviados com sucesso! Festa garantida! 🍻');
        setCurrentStep(4); // Tela de sucesso
        
        // Limpa o formulário (equivalente ao form.reset())
        setFormData({
          nome: '',
          acompanhante: '',
          chopp: '',
          comida: ''
        });
      } else {
        throw new Error(result.error || 'Ocorreu um erro desconhecido.');
      }
      
    } catch (error: unknown) {
      console.error('Erro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setSubmitStatus(`❌ Erro ao enviar: ${errorMessage}`);
    }
  };

  // Renderizar step atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepNome onSelect={selectName} generateConfetti={generateConfetti} />;
      case 1:
        return <StepCompanhia onSelect={selectCompanhia} />;
      case 2:
        return <StepChope onSelect={selectChope} beerAnimation={beerAnimation} />;
      case 3:
        return <StepRestricoes onSelect={selectRestricoes} />;
      case 4:
        return <StepSucesso />;
      default:
        return <StepNome onSelect={selectName} generateConfetti={generateConfetti} />;
    }
  };

  return (
    <div className={`app ${cursor === '😢' ? 'sad-cursor' : ''}`}>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          gravity={0.15}
          recycle={false}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
        />
      )}
      
      <div className="container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{width: `${(currentStep / 4) * 100}%`}}
          />
        </div>
        
        {renderStep()}
        
        {submitStatus && (
          <div className="status">
            {submitStatus}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Step 1 - Seleção de Nome
const StepNome: React.FC<{
  onSelect: (nome: string) => void;
  generateConfetti: () => void;
}> = ({onSelect, generateConfetti}) => {
  const [poppedBalloon, setPoppedBalloon] = useState<string | null>(null);

  const balloonVariants = {
    initial: { 
      scale: 0.8, 
      opacity: 1, 
      y: 0,
      rotate: 0
    },
    hover: { 
      scale: 1.1,
      y: -10,
      rotate: 5
    },
    pop: {
      scale: 0,
      opacity: 0,
      y: -100,
      rotate: 180
    },
  };

  const handleBalloonClick = (nome: string) => {
    setPoppedBalloon(nome);
    playPopSound();
    generateConfetti(); // Adiciona confetti quando clica no balão
    
    // Chama a função onSelect passada pelo componente pai
    setTimeout(() => {
      onSelect(nome);
    }, 600);
  };

  const playPopSound = () => {
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSYFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsPDjiS2/K8ey4FG3vK8N2/VgYObKzq8qF/GRIVe9bz1m0fFDQ7ndTy6kUVCVWn6O22ZRURbL3y8qGHGhMVe9bt1m0fGTQ7ntTy6kUVCVWn6O22ZRURbL3y8qGHGhMVe9bt1m0fGTQ7ntTy6kUVCVWn6O22ZRQSar3z8Z6DHBIUeNXt2W0fGTQ7ndTy';
    audio.play().catch(() => {});
  };

  return (
    <div className="step">
      <h1>🎈 Quem é você? 🎈</h1>
      <p>Clique no seu balão e veja a mágica acontecer!</p>
      <div className="balloons-container">
        <AnimatePresence>
          {NOMES.map((nome) => (
            <motion.button
              key={nome}
              className="balloon"
              data-name={nome}
              variants={balloonVariants}
              initial="initial"
              whileHover={poppedBalloon ? {} : "hover"}
              animate={poppedBalloon === nome ? "pop" : "initial"}
              exit="pop"
              onClick={() => handleBalloonClick(nome)}
              disabled={poppedBalloon !== null}
            >
              {nome}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Componente Step 2 - Companhia
const StepCompanhia: React.FC<{onSelect: (acompanhante: string) => void}> = ({onSelect}) => {
  const [fishCaught, setFishCaught] = useState<string | null>(null);

  const fishVariants = {
    swimming: {
      x: [0, 50, -30, 20, 0],
      y: [0, -20, 30, -10, 0],
      rotate: [0, 15, -10, 5, 0]
    },
    caught: {
      scale: 1.5,
      rotate: 360,
      y: -50
    }
  };

  const handleFishClick = (acompanhante: string) => {
    // Se conseguiu clicar no peixe, pescou automaticamente!
    setFishCaught(acompanhante);
    
    // Som de sucesso
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRvQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdAAAAA';
    audio.volume = 1.0;
    audio.play().catch(() => {});
    
    // Vai direto para a próxima pergunta
    setTimeout(() => {
      onSelect(acompanhante);
    }, 1000);
  };

  return (
    <div className="step">
      <h1>🎣 Vai levar o homi ou a muié? 🎣</h1>
      <p>🐟 Desafio: Conseguir CLICAR nos peixes que nadam livremente!</p>
      <div className="fishing-container">
        <motion.button 
          className="option-button alone"
          onClick={() => onSelect('sozinho')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          😢 Vou sozinho (muito mais fácil!)
        </motion.button>
        
        <div className="fishing-area">
          {/* Peixes se movendo organicamente */}
          <motion.button 
            className={`fish homi ${fishCaught === 'homi' ? 'caught' : ''}`}
            onClick={() => handleFishClick('homi')}
            disabled={fishCaught !== null}
            variants={fishVariants}
            animate={fishCaught === 'homi' ? 'caught' : 'swimming'}
            transition={fishCaught === 'homi' ? { duration: 0.8 } : { duration: 4, repeat: Infinity }}
            whileHover={{ scale: 1.2 }}
          >
            🐟 Homi
          </motion.button>
          <motion.button 
            className={`fish muie ${fishCaught === 'muie' ? 'caught' : ''}`}
            onClick={() => handleFishClick('muie')}
            disabled={fishCaught !== null}
            variants={fishVariants}
            animate={fishCaught === 'muie' ? 'caught' : 'swimming'}
            transition={fishCaught === 'muie' ? { duration: 0.8 } : { duration: 4, repeat: Infinity }}
            whileHover={{ scale: 1.2 }}
          >
            🐠 Muié
          </motion.button>
          
          {/* Peixes menores que atrapalham visualmente */}
          {[...Array(8)].map((_, i) => (
            <motion.div 
              key={i} 
              className="decoy-fish" 
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 60 - 30],
                rotate: [0, Math.random() * 360]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
            />
          ))}
          
          {/* Bolhas animadas */}
          {[...Array(6)].map((_, i) => (
            <motion.div 
              key={i} 
              className="bubble" 
              animate={{
                y: [-10, -100],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
              style={{
                left: `${Math.random() * 90}%`,
              }}
            />
          ))}
          
          {/* Algas balançando */}
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i} 
              className="seaweed"
              animate={{
                rotate: [-10, 10, -10],
                scaleY: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${Math.random() * 90}%`,
              }}
            />
          ))}
        </div>
        
        {fishCaught && (
          <motion.p 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{color: 'white', fontWeight: 'bold', fontSize: '1.4em', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}
          >
            🎉 PESCADO! Você conseguiu clicar no peixe! 🎉
          </motion.p>
        )}
      </div>
    </div>
  );
};

// Componente Step 3 - Chope
const StepChope: React.FC<{
  onSelect: (chopp: string) => void;
  beerAnimation: 'none' | 'filling-double' | 'filling-single';
}> = ({onSelect, beerAnimation}) => {
  return (
    <div className="step">
      <h1>🍺 E a bebida? 🥤</h1>
      <div className="beer-container">
        <motion.div 
          className="beer-tap"
          animate={beerAnimation !== 'none' ? { rotate: [0, -15, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="tap-handle" />
          <div className="tap-spout" />
        </motion.div>
        
        <div className="beer-options">
          <motion.button 
            className="beer-option"
            onClick={() => onSelect('rachar')}
            disabled={beerAnimation !== 'none'}
            whileHover={beerAnimation === 'none' ? { scale: 1.02 } : {}}
            whileTap={beerAnimation === 'none' ? { scale: 0.98 } : {}}
          >
            <div className="beer-glasses">
              <motion.div 
                className={`beer-glass ${beerAnimation === 'filling-double' ? 'filling' : ''}`}
                animate={beerAnimation === 'filling-double' ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.8, repeat: 3 }}
              >
                <div className="beer-liquid beer" />
                <div className="beer-foam" />
                <div className="glass-shine" />
              </motion.div>
              <motion.div 
                className={`beer-glass ${beerAnimation === 'filling-double' ? 'filling' : ''}`}
                animate={beerAnimation === 'filling-double' ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.8, repeat: 3, delay: 0.2 }}
              >
                <div className="beer-liquid beer" />
                <div className="beer-foam" />
                <div className="glass-shine" />
              </motion.div>
            </div>
            <p>🍻 Vamos rachar um chopp!</p>
          </motion.button>
          
          <motion.button 
            className="beer-option"
            onClick={() => onSelect('eu_pago')}
            disabled={beerAnimation !== 'none'}
            whileHover={beerAnimation === 'none' ? { scale: 1.02 } : {}}
            whileTap={beerAnimation === 'none' ? { scale: 0.98 } : {}}
          >
            <div className="beer-glasses single-glass">
              <motion.div 
                className={`beer-glass-large coca-glass ${beerAnimation === 'filling-single' ? 'filling' : ''}`}
                animate={beerAnimation === 'filling-single' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.2, repeat: 2 }}
              >
                <div className="beer-liquid coca" />
                <div className="coca-bubbles" />
                <div className="glass-shine" />
                <motion.div 
                  className="ice-cubes"
                  animate={beerAnimation === 'filling-single' ? { y: [0, -2, 0] } : {}}
                  transition={{ duration: 0.6, repeat: 4 }}
                >
                  🧊
                </motion.div>
              </motion.div>
            </div>
            <p>🥤 Vou levar minha própria bebida</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Componente Step 4 - Restrições
const StepRestricoes: React.FC<{onSelect: (comida: string) => void}> = ({onSelect}) => {
  return (
    <div className="step">
      <h1>🥩 E o churrasco? 🥩</h1>
      <p>Vai ser um churrasco de domingo comum, tem alguma restrição, ou pode levar linguiça?</p>
      <div className="restriction-options">
        <motion.button 
          className="restriction-button normal"
          onClick={() => onSelect('normal')}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          🥩 Churrasco normal, pode tudo!
        </motion.button>
        <motion.button 
          className="restriction-button restrictions"
          onClick={() => onSelect('restricoes')}
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          🥗 Tenho restrições alimentares
        </motion.button>
        <motion.button 
          className="restriction-button linguica"
          onClick={() => onSelect('linguica')}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          🌭 LINGUIÇA OBRIGATÓRIA!
        </motion.button>
      </div>
    </div>
  );
};

// Componente Step 5 - Sucesso
const StepSucesso: React.FC = () => {
  // Função para adicionar evento no Google Calendar
  const addToGoogleCalendar = () => {
    const eventDetails = {
      text: 'Aniversário do Henrique - Churrasco',
      dates: '20250824T150000Z/20250824T220000Z', // 24/08/2025 das 12:00 às 19:00 (horário de Brasília)
      details: 'Festa de aniversário com churrasco, bebidas e muita diversão!',
      location: 'R. Barão do Rio Branco, 161 - Vila San Remo I, Piraquara - PR, 83308-010',
      ctz: 'America/Sao_Paulo'
    };
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}&ctz=${eventDetails.ctz}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  // Função para adicionar evento no calendário do iPhone/Apple
  const addToAppleCalendar = () => {
    const eventDetails = {
      title: 'Aniversário do Henrique - Churrasco',
      startDate: '2025-08-24T15:00:00-03:00',
      endDate: '2025-08-24T22:00:00-03:00',
      location: 'R. Barão do Rio Branco, 161 - Vila San Remo I, Piraquara - PR, 83308-010',
      notes: 'Festa de aniversário com churrasco, bebidas e muita diversão!'
    };

    // Criar arquivo .ics para download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aniversário Henrique//PT
BEGIN:VEVENT
UID:${Date.now()}@aniversario-henrique.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTSTART:20250824T180000Z
DTEND:20250825T010000Z
SUMMARY:${eventDetails.title}
DESCRIPTION:${eventDetails.notes}
LOCATION:${eventDetails.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aniversario-henrique.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="step success">
      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        🎉 Sucesso! 🎉
      </motion.h1>
      <div className="success-animation">
        <motion.div 
          className="party-emoji"
          animate={{ rotate: 360, scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎊
        </motion.div>
        <motion.div 
          className="party-emoji"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🍻
        </motion.div>
        <motion.div 
          className="party-emoji"
          animate={{ rotate: [0, 20, -20, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          🥳
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Seus dados foram enviados com sucesso!
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Agora é só aguardar o churrasquinho! 🔥
      </motion.p>

      {/* Informações da data */}
      <motion.div
        className="event-date-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3>📅 Quando vai ser a festa</h3>
        <div className="date-info">
          <p className="event-date">24 de Agosto de 2025 (Domingo)</p>
          <p className="event-time">⏰ Das 12:00 às 19:00</p>
        </div>
        
        {/* Botões para adicionar na agenda */}
        <div className="calendar-buttons">
          <motion.button
            className="calendar-button google"
            onClick={addToGoogleCalendar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📅 Adicionar no Google Calendar
          </motion.button>
          
          <motion.button
            className="calendar-button apple"
            onClick={addToAppleCalendar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🍎 Adicionar no iPhone/Apple
          </motion.button>
        </div>
      </motion.div>

      {/* Mapa da localização */}
      <motion.div
        className="location-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3>📍 Onde vai ser a bagaça</h3>
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d115278.2779322309!2d-49.163196323910796!3d-25.456772603631173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x94dcf3a0c19ba18b%3A0x2418462065a216ea!2sR.%20Bar%C3%A3o%20do%20Rio%20Branco%2C%20161%20-%20Vila%20San%20Remo%20I%2C%20Piraquara%20-%20PR%2C%2083308-010!3m2!1d-25.456792999999998!2d-49.0807992!5e0!3m2!1spt-BR!2sbr!4v1754520666898!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="300" 
            style={{border: 0, borderRadius: '10px'}} 
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização do Evento"
          />
        </div>
      </motion.div>

      {/* Botões de ação */}
      <div className="action-buttons">
        <motion.button 
          className="restart-button"
          onClick={() => window.location.reload()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔄 Fazer outro cadastro
        </motion.button>

        <motion.a 
          href="https://wa.me/5541991567448?text=Muito%20bom%20o%20seu%20formulário%20Henrique%2C%20mas%20queria%20tirar%20uma%20dúvida%20contigo%20sobre%3A"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="whatsapp-icon">📱</span>
          Dúvidas?
        </motion.a>
      </div>
    </div>
  );
};

export default App
