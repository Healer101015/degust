import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import logo from "./assets/logo.png";
import coxinhaImg from "./assets/coxinha.jpg";
import placeholderImg from "./assets/coxinha.jpg";

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
];

const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function DegustApp() {
  const [cart, setCart] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const menuRef = useRef(null);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleAddToCart = (salgado) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === salgado.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === salgado.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
    const pedido = cart.map((item) => `${item.quantity}x ${item.label}`).join("\n• ");
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
    setIsPrinting(true);
  };

  useEffect(() => {
    if (isPrinting) {
      if (menuRef.current) {
        html2canvas(menuRef.current, {
          useCORS: true,
          scale: 2,
          backgroundColor: "#171717",
        }).then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "cardapio-degust.png";
          link.click();
          setIsPrinting(false);
        });
      } else {
        setIsPrinting(false);
      }
    }
  }, [isPrinting]);

  return (
    <div className="min-h-screen bg-black text-yellow-50 font-inter">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/80 border-b border-yellow-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Degust Logo" className="w-10 h-10 rounded-2xl" />
            <h1 className="text-xl sm:text-2xl font-bold font-sora tracking-tight text-yellow-400">Degust</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:px-6 grid lg:grid-cols-3 gap-6 lg:gap-8">
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5 px-1">
            <h2 className="text-3xl font-bold font-sora text-yellow-400">Nosso Cardápio</h2>
            <button
              onClick={handleDownloadMenu}
              className="px-4 py-2 rounded-lg border text-sm font-semibold shadow-sm transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-700 hover:shadow-md"
            >
              Baixar Cardápio
            </button>
          </div>

          <div ref={menuRef} className={`p-1 ${isPrinting ? "bg-black" : ""}`}>
            {isPrinting && (
              <div className="mb-8 text-center p-6">
                <img
                  src={logo}
                  alt="Degust Logo"
                  className="w-20 h-20 mx-auto rounded-3xl mb-3"
                />
                <h1 className="text-4xl font-bold font-sora text-yellow-400">
                  Cardápio Degust
                </h1>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {SALGADOS.map((salgado) => (
                <div
                  key={salgado.id}
                  className="flex items-center bg-gray-900 rounded-xl border border-yellow-900 shadow-sm p-4"
                >
                  <img
                    src={salgado.image}
                    alt={salgado.label}
                    className="w-16 h-16 rounded-md object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-yellow-400">{salgado.label}</h3>
                    <p className="text-sm text-yellow-200">{salgado.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400">{brl(salgado.price)}</p>
                    {!isPrinting && (
                      <button
                        onClick={() => handleAddToCart(salgado)}
                        className="mt-2 px-3 py-1 text-sm font-semibold rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black shadow-sm"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="bg-gray-900 rounded-2xl shadow-sm border border-yellow-900 p-5 sticky top-24">
            <h2 className="text-xl font-bold mb-5 font-sora text-yellow-400">Seu Pedido</h2>
            {cart.length === 0 ? (
              <p className="text-yellow-200 text-sm py-4 text-center">
                Seu carrinho está vazio.
              </p>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex-1">
                      <span className="font-bold block text-yellow-400">{item.label}</span>
                      <span className="text-yellow-200">{brl(item.price)}</span>
                    </div>
                    <div className="flex items-center gap-2 border border-yellow-900 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="font-bold text-lg w-6 h-6 text-red-500 rounded-full hover:bg-red-900 transition"
                      >
                        -
                      </button>
                      <span className="font-bold text-center w-6 text-yellow-400">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="font-bold text-lg w-6 h-6 text-green-500 rounded-full hover:bg-green-900 transition"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 border-t border-yellow-900 pt-5">
              <div className="flex items-baseline justify-between mb-5">
                <span className="text-yellow-200 font-medium">Total</span>
                <span className="text-2xl font-bold font-sora text-yellow-400">{brl(total)}</span>
              </div>
              <button
                onClick={sendToWhatsApp}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg shadow-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${cart.length > 0
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black transform hover:scale-105"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.25 18a.75.75 0 01-.75-.75V2.75a.75.75 0 011.5 0v14.5a.75.75 0 01-.75.75zM4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" />
                </svg>
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