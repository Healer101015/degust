import React, { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import logo from "./assets/logo.png";
import coxinhaImg from "./assets/coxinha.jpg";
import placeholderImg from "./assets/salgado_placeholder.jpg";

// --- DADOS E CONSTANTES ---
const WHATSAPP_NUMBER = "7182330587";
const SALGADOS = [
  { id: "frango", label: "Frango", desc: "Coxinha de frango", price: 6.0, image: coxinhaImg },
  { id: "frango_catupiry", label: "Frango com Catupiry", desc: "Frango + catupiry", price: 6.5, image: coxinhaImg },
  { id: "carne_ervilha", label: "Carne com Ervilha", desc: "Carne + ervilha", price: 7.0, image: placeholderImg },
  { id: "calabresa_apimentada", label: "Calabresa Apimentada", desc: "Calabresa picante", price: 6.5, image: placeholderImg },
  { id: "carne_hamburguer_queijo", label: "Carne de Hambúrguer com Queijo", desc: "Hambúrguer + queijo", price: 6.5, image: placeholderImg },
  { id: "queijo_presunto", label: "Queijo e Presunto", desc: "Presunto + queijo", price: 7.0, image: placeholderImg },
  { id: "carne_sol_catupiry", label: "Carne de Sol com Catupiry", desc: "Carne de sol + catupiry", price: 8.5, image: placeholderImg },
  { id: "hamburguer_especial", label: "Hambúrguer Especial", desc: "Hambúrguer, queijo, pitbull e camarão", price: 10.0, image: placeholderImg },
].sort((a, b) => a.price - b.price);

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function DegustApp() {
  // --- ESTADOS DO COMPONENTE ---
  const [cart, setCart] = useState(() => {
    // MELHORIA 6: PERSISTÊNCIA DO CARRINHO COM LOCALSTORAGE
    // Carrega o carrinho do localStorage ao iniciar, ou um array vazio se não houver nada.
    const savedCart = localStorage.getItem("degustCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [popup, setPopup] = useState({ show: false, message: '', key: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  const menuRef = useRef(null);
  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const totalItemsInCart = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // --- EFEITOS (LIFECYCLE) ---

  // Salva o carrinho no localStorage sempre que ele for alterado.
  useEffect(() => {
    localStorage.setItem("degustCart", JSON.stringify(cart));
  }, [cart]);

  // Controla a visibilidade do botão "Voltar ao Topo".
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

  // MELHORIA 1: FILTRO DE PRODUTOS
  // Filtra os salgados com base no termo de busca e no filtro de preço.
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

    // MELHORIA 3: NOTIFICAÇÃO (POPUP) ANIMADA
    // Adiciona uma chave única para reiniciar a animação a cada clique.
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

  // MELHORIA 4: BOTÃO PARA LIMPAR O CARRINHO
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

  const handleDownloadMenu = () => {
    setIsDownloading(true); // MELHORIA 8: FEEDBACK DE CARREGAMENTO NO DOWNLOAD
    html2canvas(menuRef.current, { useCORS: true, scale: 2, backgroundColor: "#000" })
      .then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "cardapio-degust.png";
        link.click();
      })
      .finally(() => setIsDownloading(false));
  };

  // MELHORIA 7: BOTÃO "VOLTAR AO TOPO"
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="min-h-screen bg-black text-yellow-50 font-inter">
      {/* Pop-up animado */}
      {popup.show && (
        <div key={popup.key} className="fixed top-5 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-slideIn">
          {popup.message}
        </div>
      )}

      {/* Botão "Voltar ao Topo" */}
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

          {/* MELHORIA 2: FILTROS DE CATEGORIA E BUSCA */}
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-yellow-900 flex flex-col md:flex-row gap-4">
            <input type="text" placeholder="Buscar salgado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-grow bg-gray-800 border border-yellow-800 rounded-md px-3 py-2 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <div className="flex items-center gap-2">
              <button onClick={() => setPriceFilter('all')} className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'all' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-200'}`}>Todos</button>
              <button onClick={() => setPriceFilter('under7')} className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'under7' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-200'}`}>Até R$7</button>
              <button onClick={() => setPriceFilter('over7')} className={`px-3 py-1 rounded-md text-sm ${priceFilter === 'over7' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-yellow-200'}`}>Acima de R$7</button>
            </div>
          </div>

          <div ref={menuRef} className="p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSalgados.length > 0 ? filteredSalgados.map((salgado) => (
                // MELHORIA 10: EFEITOS DE HOVER APRIMORADOS
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
              {/* MELHORIA 9: BADGE COM TOTAL DE ITENS */}
              {totalItemsInCart > 0 && (
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">{totalItemsInCart} {totalItemsInCart > 1 ? 'itens' : 'item'}</span>
              )}
            </div>

            {cart.length === 0 ? (
              // MELHORIA 5: ÍCONE NO CARRINHO VAZIO
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