import React, { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import logo from "./assets/logo.png";
import coxinhaImg from "./assets/coxinha.jpg";
import coxinhaImg2 from "./assets/coxinha7.jpg";
import placeholderImg1 from "./assets/batata.jpg";
import placeholderImg from "./assets/coxinha1.jpg";
import placeholderImg2 from "./assets/coxinha2.jpg";
import placeholderImg3 from "./assets/coxinha3.png";
import placeholderImg4 from "./assets/coxinha4.jpg";
import placeholderImg5 from "./assets/coxinha5.jpg";
import placeholderImg6 from "./assets/coxinha6.jpg";


// --- DADOS E CONSTANTES ---
const WHATSAPP_NUMBER = "7182330587";
const SALGADOS = [
  { id: "tradicional", label: "Tradicional", desc: "Frango", price: 7.0, image: coxinhaImg },
  { id: "caipira", label: "Caipira", desc: "Frango com catupiry", price: 7.5, image: coxinhaImg2 },
  { id: "pizza", label: "Pizza", desc: "Queijo, presunto e orégano", price: 7.5, image: placeholderImg },
  { id: "baiana", label: "Baiana", desc: "Calabresa, Pimenta calabresa", price: 6.5, image: placeholderImg2 },
  { id: "brutos", label: "Brutos", desc: "Carne de hambúrguer, presunto e queijo", price: 7.0, image: placeholderImg3 },
  { id: "nordestina", label: "Nordestina", desc: "Carne de sol com catupiry", price: 8.5, image: placeholderImg4 },
  { id: "bovino", label: "Bovino", desc: "Carne com ervilha", price: 7.5, image: placeholderImg5 },
  { id: "ouro_do_mar", label: "Ouro do Mar", desc: "Camarão", price: 12.0, image: placeholderImg6 },
  { id: "batata_frita", label: "Batata Frita", desc: "300g, queijo e ketchup", price: 10.0, image: placeholderImg1 }
].sort((a, b) => a.price - b.price);

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// --- NOVO COMPONENTE: CARDÁPIO PARA DOWNLOAD ---
// Este componente tem um design aprimorado e será usado para gerar a imagem.
// Ele fica invisível na tela principal.
const DownloadableMenu = React.forwardRef((props, ref) => (
  <div ref={ref} className="absolute -left-[9999px] top-0 w-[800px] bg-black p-12 font-inter text-white">
    <div className="text-center mb-10">
      <img src={logo} alt="Degust Logo" className="w-24 h-24 rounded-3xl mx-auto mb-4 border-4 border-yellow-500" />
      <h1 className="text-6xl font-bold font-sora text-yellow-400">Degust</h1>
      <p className="text-yellow-200 text-lg">O melhor sabor da região</p>
    </div>

    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
      <div className="col-span-1 flex flex-col justify-center">
        <h2 className="text-4xl font-sora font-bold text-yellow-400 border-b-2 border-yellow-800 pb-2 mb-6">Nosso Cardápio</h2>
        {SALGADOS.slice(0, Math.ceil(SALGADOS.length / 2)).map(salgado => (
          <div key={salgado.id} className="flex justify-between items-baseline mb-3">
            <div>
              <h3 className="text-xl font-bold text-yellow-300">{salgado.label}</h3>
              <p className="text-sm text-yellow-200">{salgado.desc}</p>
            </div>
            <div className="flex-1 border-b border-dashed border-yellow-800 mx-2"></div>
            <p className="text-xl font-bold text-yellow-300">{brl(salgado.price)}</p>
          </div>
        ))}
      </div>
      <div className="col-span-1 flex flex-col justify-center">
        {SALGADOS.slice(Math.ceil(SALGADOS.length / 2)).map(salgado => (
          <div key={salgado.id} className="flex justify-between items-baseline mb-3">
            <div>
              <h3 className="text-xl font-bold text-yellow-300">{salgado.label}</h3>
              <p className="text-sm text-yellow-200">{salgado.desc}</p>
            </div>
            <div className="flex-1 border-b border-dashed border-yellow-800 mx-2"></div>
            <p className="text-xl font-bold text-yellow-300">{brl(salgado.price)}</p>
          </div>
        ))}
        <img src={coxinhaImg} alt="Coxinha" className="rounded-lg mt-6 w-full object-cover h-48 shadow-lg shadow-yellow-500/10" />
      </div>
    </div>
    <div className="text-center mt-12 text-yellow-200">
      <p>Faça seu pedido pelo WhatsApp!</p>
      <p className="font-bold text-xl">{WHATSAPP_NUMBER}</p>
    </div>
  </div>
));


export default function DegustApp() {
  // --- ESTADOS DO COMPONENTE ---
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("degustCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [popup, setPopup] = useState({ show: false, message: '', key: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  // MUDANÇA: Ref renomeada para o cardápio visível
  const menuOnScreenRef = useRef(null);
  // MUDANÇA: Nova ref para o cardápio de download
  const downloadableMenuRef = useRef(null);

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const totalItemsInCart = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // --- EFEITOS (LIFECYCLE) ---
  useEffect(() => {
    localStorage.setItem("degustCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScroll]);

  // --- FUNÇÕES DE LÓGICA ---
  const filteredSalgados = useMemo(() => {
    return SALGADOS.filter(salgado => {
      const matchesSearch = salgado.label.toLowerCase().includes(searchTerm.toLowerCase());
      if (priceFilter === 'all') return matchesSearch;
      if (priceFilter === 'under7') return matchesSearch && salgado.price <= 7;
      if (priceFilter === 'over7') return matchesSearch && salgado.price > 7;
      return false;
    });
  }, [searchTerm, priceFilter]);

  const handleAddToCart = (salgado) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === salgado.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === salgado.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...salgado, quantity: 1 }];
    });
    setPopup({ show: true, message: `${salgado.label} adicionado!`, key: Date.now() });
    setTimeout(() => setPopup(p => ({ ...p, show: false })), 3000);
  };

  const updateQuantity = (salgadoId, amount) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === salgadoId) {
          return { ...item, quantity: Math.max(0, item.quantity + amount) };
        }
        return item;
      });
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  const clearCart = () => {
    if (window.confirm("Tem certeza que deseja esvaziar o carrinho?")) {
      setCart([]);
    }
  };

  const sendToWhatsApp = () => {
    const pedido = cart.map((item) => `${item.quantity}x ${item.label}`).join("\n• ");
    const msg = `Olá, Degust! Gostaria de fazer um pedido:\n\n*Itens:*\n• ${pedido}\n\n*Total:* ${brl(total)}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  // MUDANÇA: Lógica de download atualizada para usar a nova ref
  const handleDownloadMenu = () => {
    setIsDownloading(true);
    html2canvas(downloadableMenuRef.current, { useCORS: true, scale: 2 })
      .then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "cardapio-degust.png";
        link.click();
      })
      .finally(() => setIsDownloading(false));
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="min-h-screen bg-black text-yellow-50 font-inter">
      {/* MUDANÇA: Adicionado o componente invisível do cardápio para download */}
      <DownloadableMenu ref={downloadableMenuRef} />

      {popup.show && (
        <div key={popup.key} className="fixed top-5 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-slideIn">
          {popup.message}
        </div>
      )}

      {showScroll && (
        <button onClick={scrollTop} aria-label="Voltar ao topo" className="fixed bottom-5 right-5 w-12 h-12 bg-yellow-500 text-black rounded-full shadow-lg z-50 flex items-center justify-center transition-transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </button>
      )}

      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/80 border-b border-yellow-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Degust Logo" className="w-10 h-10 rounded-2xl" />
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-yellow-400">Degust</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-3xl font-bold font-sora text-yellow-400">Nosso Cardápio</h2>
            <button onClick={handleDownloadMenu} disabled={isDownloading} className="px-4 py-2 w-full sm:w-auto rounded-lg border text-sm font-semibold shadow-sm transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Baixando...
                </>
              ) : "Baixar Cardápio"}
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-yellow-900 flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Buscar salgado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow bg-gray-800 border border-yellow-800 rounded-md px-3 py-2 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <div className="flex items-center gap-2">
              <button onClick={() => setPriceFilter('all')} className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'all' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-200'}`}>Todos</button>
              <button onClick={() => setPriceFilter('under7')} className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'under7' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-200'}`}>Até R$7</button>
              <button onClick={() => setPriceFilter('over7')} className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'over7' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-200'}`}>Acima de R$7</button>
            </div>
          </div>

          <div ref={menuOnScreenRef} className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSalgados.length > 0 ? filteredSalgados.map((salgado) => (
                <div key={salgado.id} className="flex items-center bg-gray-900 rounded-xl border border-yellow-900 shadow-sm p-4 transition-all duration-300 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:-translate-y-1">
                  <img src={salgado.image} alt={salgado.label} className="w-20 h-20 rounded-md object-cover mr-4" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-yellow-400">{salgado.label}</h3>
                    <p className="text-sm text-yellow-200">{salgado.desc}</p>
                    <p className="font-bold text-yellow-400 mt-1">{brl(salgado.price)}</p>
                  </div>
                  <button onClick={() => handleAddToCart(salgado)} aria-label={`Adicionar ${salgado.label} ao carrinho`} className="self-end px-3 py-1 text-lg font-bold rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black shadow-sm transition-transform hover:scale-110">+</button>
                </div>
              )) : (
                <p className="text-yellow-200 md:col-span-2 text-center py-8">Nenhum salgado encontrado com esses filtros.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-gray-900 rounded-2xl shadow-sm border border-yellow-900 p-5 sticky top-24">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold font-sora text-yellow-400">Seu Pedido</h2>
              {totalItemsInCart > 0 && (
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">{totalItemsInCart} {totalItemsInCart > 1 ? 'itens' : 'item'}</span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p className="text-yellow-200 text-sm mt-2">Seu carrinho está vazio.</p>
              </div>
            ) : (
              <>
                <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex-1">
                        <span className="font-bold block text-yellow-400">{item.label}</span>
                        <span className="text-yellow-200">{brl(item.price)}</span>
                      </div>
                      <div className="flex items-center gap-2 border border-yellow-900 rounded-lg px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="font-bold text-lg w-6 h-6 text-red-500 rounded-full hover:bg-red-900/50 transition">-</button>
                        <span className="font-bold text-center w-6 text-yellow-400">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="font-bold text-lg w-6 h-6 text-green-500 rounded-full hover:bg-green-900/50 transition">+</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button onClick={clearCart} className="text-xs text-red-500 hover:underline mt-4">Esvaziar carrinho</button>
              </>
            )}

            <div className="mt-6 border-t border-yellow-900 pt-5">
              <div className="flex items-baseline justify-between mb-5">
                <span className="text-yellow-200 font-medium">Total</span>
                <span className="text-2xl font-bold font-sora text-yellow-400">{brl(total)}</span>
              </div>
              <button onClick={sendToWhatsApp} disabled={cart.length === 0} className="w-full py-3 rounded-lg shadow-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black transform enabled:hover:scale-105 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                Finalizar no WhatsApp
              </button>
            </div>
          </div>
        </aside>
      </main>

      <footer className="max-w-6xl mx-auto p-6 text-center text-xs text-yellow-200 font-medium">
        © {new Date().getFullYear()} Degust. Todos os direitos reservados.
      </footer>
    </div>
  );
}