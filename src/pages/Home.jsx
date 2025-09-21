import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import logo from "./assets/logo.png";
import coxinhaImg from "./assets/coxinha.jpg";
import placeholderImg from "./assets/salgado_placeholder.jpg";

const WHATSAPP_NUMBER = "7182330587";

const SALGADOS = [
  { id: "frango", label: "Frango", price: 6.00, image: coxinhaImg },
  { id: "frango_catupiry", label: "Frango com Catupiry", price: 6.50, image: coxinhaImg },
  { id: "carne_ervilha", label: "Carne com Ervilha", price: 7.00, image: placeholderImg },
  { id: "calabresa_apimentada", label: "Calabresa Apimentada", price: 6.50, image: placeholderImg },
  { id: "carne_hamburguer_queijo", label: "Carne de Hambúrguer com Queijo", price: 6.50, image: placeholderImg },
  { id: "queijo_presunto", label: "Queijo e Presunto", price: 7.00, image: placeholderImg },
  { id: "carne_sol_catupiry", label: "Carne de Sol com Catupiry", price: 8.50, image: placeholderImg },
  { id: "carne_hamburguer_queijo_pitbull_camarao", label: "Hambúrguer, Queijo, Pitbull e Camarão", price: 10.00, image: placeholderImg },
];

const brl = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function DegustApp() {
  const [cart, setCart] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [isPrinting, setIsPrinting] = useState(false); // Novo estado para controlar a impressão
  const menuRef = useRef(null);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleAddToCart = (salgado) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === salgado.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === salgado.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...salgado, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (salgadoId, amount) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === salgadoId) {
          return { ...item, quantity: item.quantity + amount };
        }
        return item;
      });
      return updatedCart.filter((item) => item.quantity > 0);
    });
  };

  const sendToWhatsApp = () => {
    const pedido = cart.map(item => `${item.quantity}x ${item.label}`).join("\n• ");
    const msg = [
      "Olá, Degust! Gostaria de fazer um pedido:",
      `\n*Itens:*`,
      `• ${pedido}`,
      `\n*Observações:* ${observacoes || "Nenhuma"}`,
      `\n*Total:* ${brl(total)}`,
    ].join("\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleDownloadMenu = () => {
    setIsPrinting(true); // Ativa o modo de impressão
  };

  // Efeito para gerar o canvas APÓS o componente re-renderizar sem os botões
  useEffect(() => {
    if (isPrinting) {
      if (menuRef.current) {
        html2canvas(menuRef.current, {
          useCORS: true,
          scale: 2,
        }).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "cardapio-degust.png";
          link.click();
          setIsPrinting(false); // Desativa o modo de impressão após o download
        });
      } else {
        setIsPrinting(false);
      }
    }
  }, [isPrinting]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Degust Logo" className="w-10 h-10 rounded-2xl" />
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-800">Degust</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid lg:grid-cols-3 gap-4 lg:gap-6">
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-2xl font-bold text-stone-800">Nosso Cardápio</h2>
            <button
              onClick={handleDownloadMenu}
              className="px-4 py-2 rounded-xl border text-sm font-semibold shadow-sm transition bg-white hover:bg-stone-100 text-stone-700 border-stone-300"
            >
              Baixar Cardápio
            </button>
          </div>
          {/* A área de impressão começa aqui */}
          <div ref={menuRef} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 mb-4">
            {/* Logo e título visíveis apenas na impressão */}
            {isPrinting && (
              <div className="mb-6 text-center">
                <img src={logo} alt="Degust Logo" className="w-16 h-16 mx-auto rounded-3xl mb-2" />
                <h1 className="text-3xl font-extrabold text-stone-800">Cardápio Degust</h1>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {SALGADOS.map((salgado) => (
                <div key={salgado.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col transition hover:shadow-lg">
                  <img src={salgado.image} alt={salgado.label} className="w-full h-40 object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{salgado.label}</h3>
                      <p className="text-sm text-slate-500">{brl(salgado.price)}</p>
                    </div>
                    {/* O botão só aparece se não estiver no modo de impressão */}
                    {!isPrinting && (
                      <button
                        onClick={() => handleAddToCart(salgado)}
                        className="mt-3 w-full px-4 py-2 rounded-xl border text-sm font-semibold shadow-sm transition bg-amber-400 hover:bg-amber-500 text-amber-900 border-amber-500"
                      >
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-2">Observações</h2>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex.: sem pimenta, etc..."
              className="w-full min-h-[90px] rounded-xl border border-stone-200 p-3 outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 sticky top-20">
            <h2 className="text-lg font-bold mb-4">Seu Pedido</h2>
            {cart.length === 0 ? (
              <p className="text-slate-500 text-sm">Seu carrinho está vazio.</p>
            ) : (
              <ul className="space-y-4 text-sm">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold block">{item.label}</span>
                      <span className="text-slate-500">{brl(item.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="font-bold text-lg w-6 h-6 text-red-500">-</button>
                      <span className="font-medium text-center w-6">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="font-bold text-lg w-6 h-6 text-green-500">+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 border-t border-stone-200 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-500">Total</span>
                <span className="text-2xl font-extrabold">{brl(total)}</span>
              </div>
            </div>
            <button
              onClick={sendToWhatsApp}
              disabled={cart.length === 0}
              className={`w-full mt-4 px-4 py-3 rounded-xl shadow-sm font-semibold transition ${cart.length > 0
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
            >
              Finalizar no WhatsApp
            </button>
          </div>
        </aside>
      </main>

      <footer className="max-w-5xl mx-auto p-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Degust
      </footer>
    </div>
  );
}