import { useRef } from "react";
import html2canvas from "html2canvas";
import logoAcademy from "../assets/images/logo-orcoma-academy-azul.png";

interface CertificadoPadraoProps {
  participante?: string;
  curso?: string;
  dataEmissao?: string;
  codigo?: string;
  preview?: boolean;
}

const W = 939;
const H = 663;
const BLUE = "#0a2fb5";
const GOLD = "#e0b94a";

function Onda({ style, flip }: { style: React.CSSProperties; flip?: boolean }) {
  const k = flip ? "b" : "t";
  return (
    <svg
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      overflow="visible"
      style={{ position: "absolute", transform: flip ? "rotate(180deg)" : undefined, ...style }}
    >
      <defs>
        <linearGradient id={`blue-${k}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0036c9" />
          <stop offset="55%" stopColor="#0047e0" />
          <stop offset="100%" stopColor="#0a1f8f" />
        </linearGradient>
        <linearGradient id={`gold-${k}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6e3a1" />
          <stop offset="45%" stopColor="#c99a3b" />
          <stop offset="100%" stopColor="#f0d58a" />
        </linearGradient>
      </defs>
      {/* faixa dourada larga, abaixo do azul */}
      <path
        d="M -60,-30 L 0,0 C 90,48 170,64 250,95 C 310,118 360,142 400,168 L 400,190 C 355,164 305,138 245,114 C 165,84 75,74 0,16 L -60,-14 Z"
        fill={`url(#gold-${k})`}
      />
      {/* faixa azul principal */}
      <path
        d="M -60,-30 H 400 V 168 C 360,142 310,118 250,95 C 170,64 90,48 0,0 Z"
        fill={`url(#blue-${k})`}
      />
      {/* filete dourado interno */}
      <path
        d="M 200,0 C 290,10 360,40 400,75 L 400,96 C 355,60 285,34 175,0 Z"
        fill={`url(#gold-${k})`}
      />
      {/* sombra azul escura */}
      <path d="M 260,0 H 400 V 60 C 360,28 310,10 260,0 Z" fill="#0a1f8f" opacity={0.6} />
    </svg>
  );
}

export default function CertificadoPadrao({
  participante = "Nome do Aluno",
  curso = "Nome do Curso",
  dataEmissao = "",
  codigo = "",
  preview = false,
}: CertificadoPadraoProps) {
  const certRef = useRef<HTMLDivElement>(null);

  async function handleExportar() {
    if (!certRef.current) return;
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `certificado_${participante.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Erro ao exportar certificado:", err);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div
        ref={certRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 980,
          aspectRatio: `${W} / ${H}`,
          background: "linear-gradient(135deg, #ffffff 0%, #f4f4f6 50%, #ffffff 100%)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(15,23,60,0.25)",
          fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
          containerType: "inline-size",
        }}
      >
        {/* moldura dourada fina */}
        <div
          style={{
            position: "absolute",
            top: "4.5%",
            left: "3.8%",
            right: "2.5%",
            bottom: "5.5%",
            border: "2.5px solid #ffd60a",
            pointerEvents: "none",
          }}
        />

        {/* ondas decorativas */}
        <Onda style={{ top: 0, right: 0, width: "43%", height: "31%" }} />
        <Onda style={{ bottom: 0, left: 0, width: "31%", height: "21%" }} flip />

        {/* logo Orcoma Academy */}
        <img
          src={logoAcademy}
          alt="Orcoma Academy"
          style={{ position: "absolute", top: "7.5%", left: "5.8%", width: "15cqw" }}
        />

        {/* conteúdo central */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 10%",
          }}
        >
          <h1
            style={{
              margin: 0,
              marginTop: "14.5%",
              fontSize: "6.4cqw",
              fontWeight: 600,
              color: "#3a3a3a",
              lineHeight: 1,
              letterSpacing: 0,
            }}
          >
            CERTIFICADO
          </h1>

          {/* linhas + selo */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.6cqw", width: "56%", marginTop: "2.6%" }}>
            <div style={{ flex: 1, height: 1.5, background: GOLD }} />
<svg viewBox="0 0 48 58" style={{ width: "4.8cqw", height: "5.8cqw" }} fill="#fff" stroke={BLUE} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
              <path d="M32 32 L37.5 55 L30 50.5 L25 56.5 L22 36 Z" />
              <path d="M16 32 L10.5 55 L18 50.5 L23 56.5 L26 36 Z" />
              <path d="M24.00,4.50 L24.55,4.62 L25.07,4.97 L25.56,5.52 L25.99,6.21 L26.38,6.99 L26.72,7.77 L27.02,8.49 L27.32,9.08 L27.63,9.50 L27.99,9.73 L28.41,9.76 L28.91,9.60 L29.50,9.29 L30.17,8.89 L30.90,8.46 L31.67,8.06 L32.43,7.75 L33.14,7.60 L33.77,7.62 L34.29,7.84 L34.66,8.26 L34.87,8.85 L34.95,9.58 L34.89,10.40 L34.75,11.25 L34.56,12.08 L34.39,12.84 L34.28,13.50 L34.28,14.02 L34.44,14.42 L34.76,14.69 L35.26,14.85 L35.92,14.95 L36.70,15.02 L37.54,15.10 L38.40,15.23 L39.19,15.43 L39.86,15.72 L40.36,16.11 L40.64,16.59 L40.70,17.15 L40.52,17.76 L40.15,18.39 L39.63,19.02 L39.01,19.62 L38.38,20.18 L37.79,20.70 L37.31,21.16 L37.01,21.59 L36.90,22.00 L37.01,22.41 L37.31,22.84 L37.79,23.30 L38.38,23.82 L39.01,24.38 L39.63,24.98 L40.15,25.61 L40.52,26.24 L40.70,26.85 L40.64,27.41 L40.36,27.89 L39.86,28.28 L39.19,28.57 L38.40,28.77 L37.54,28.90 L36.70,28.98 L35.92,29.05 L35.26,29.15 L34.76,29.31 L34.44,29.58 L34.28,29.98 L34.28,30.50 L34.39,31.16 L34.56,31.92 L34.75,32.75 L34.89,33.60 L34.95,34.42 L34.87,35.15 L34.66,35.74 L34.29,36.16 L33.77,36.38 L33.14,36.40 L32.43,36.25 L31.67,35.94 L30.90,35.54 L30.17,35.11 L29.50,34.71 L28.91,34.40 L28.41,34.24 L27.99,34.27 L27.63,34.50 L27.32,34.92 L27.02,35.51 L26.72,36.23 L26.38,37.01 L25.99,37.79 L25.56,38.48 L25.07,39.03 L24.55,39.38 L24.00,39.50 L23.45,39.38 L22.93,39.03 L22.44,38.48 L22.01,37.79 L21.62,37.01 L21.28,36.23 L20.98,35.51 L20.68,34.92 L20.37,34.50 L20.01,34.27 L19.59,34.24 L19.09,34.40 L18.50,34.71 L17.83,35.11 L17.10,35.54 L16.33,35.94 L15.57,36.25 L14.86,36.40 L14.23,36.38 L13.71,36.16 L13.34,35.74 L13.13,35.15 L13.05,34.42 L13.11,33.60 L13.25,32.75 L13.44,31.92 L13.61,31.16 L13.72,30.50 L13.72,29.98 L13.56,29.58 L13.24,29.31 L12.74,29.15 L12.08,29.05 L11.30,28.98 L10.46,28.90 L9.60,28.77 L8.81,28.57 L8.14,28.28 L7.64,27.89 L7.36,27.41 L7.30,26.85 L7.48,26.24 L7.85,25.61 L8.37,24.98 L8.99,24.38 L9.62,23.82 L10.21,23.30 L10.69,22.84 L10.99,22.41 L11.10,22.00 L10.99,21.59 L10.69,21.16 L10.21,20.70 L9.62,20.18 L8.99,19.62 L8.37,19.02 L7.85,18.39 L7.48,17.76 L7.30,17.15 L7.36,16.59 L7.64,16.11 L8.14,15.72 L8.81,15.43 L9.60,15.23 L10.46,15.10 L11.30,15.02 L12.08,14.95 L12.74,14.85 L13.24,14.69 L13.56,14.42 L13.72,14.02 L13.72,13.50 L13.61,12.84 L13.44,12.08 L13.25,11.25 L13.11,10.40 L13.05,9.58 L13.13,8.85 L13.34,8.26 L13.71,7.84 L14.23,7.62 L14.86,7.60 L15.57,7.75 L16.33,8.06 L17.10,8.46 L17.83,8.89 L18.50,9.29 L19.09,9.60 L19.59,9.76 L20.01,9.73 L20.37,9.50 L20.68,9.08 L20.98,8.49 L21.28,7.77 L21.62,6.99 L22.01,6.21 L22.44,5.52 L22.93,4.97 L23.45,4.62 Z" />
              <circle cx="24" cy="22" r="10.5" fill="none" />
              <path d="M18.5 22.5 L22.5 26.5 L30 18" fill="none" />
            </svg>
            <div style={{ flex: 1, height: 1.5, background: GOLD }} />
          </div>

          <p style={{ margin: 0, marginTop: "4.5%", fontSize: "1.9cqw", color: "#555", fontWeight: 300, letterSpacing: "0.1cqw" }}>
            CERTIFICAMOS QUE
          </p>

          {/* nome do aluno acima da linha azul */}
          <div
            style={{
              width: "72%",
              marginTop: "3.2%",
              height: "5.2cqw",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              borderBottom: "1.5px solid #1a2a6c",
              paddingBottom: "0.4cqw",
            }}
          >
            <span style={{ fontSize: "2.9cqw", fontWeight: 600, color: "#111", lineHeight: 1.1 }}>
              {participante}
            </span>
          </div>

          <p style={{ margin: 0, marginTop: "2.6%", fontSize: "1.9cqw", color: "#555", fontWeight: 300, letterSpacing: "0.1cqw" }}>
            CONCLUIU COM ÊXITO O CURSO
          </p>

          <p
            style={{
              margin: 0,
              marginTop: "3.2%",
              fontSize: "3cqw",
              fontWeight: 700,
              color: "#0038d0",
              lineHeight: 1.25,
              maxWidth: "80%",
            }}
          >
            {curso}
          </p>

          {(dataEmissao || codigo) && (
            <div style={{ display: "flex", alignItems: "center", gap: "2.4cqw", marginTop: "4.2%", textAlign: "left" }}>
              {dataEmissao && (
                <div style={{ display: "flex", alignItems: "center", gap: "1cqw" }}>
                  <svg viewBox="0 0 40 40" style={{ width: "3.6cqw", height: "3.6cqw" }} fill="none" stroke="#f5cf62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="7" width="34" height="30" rx="4" />
                    <path d="M3 15 H37 M12 3 V10 M28 3 V10" />
                    <rect x="9" y="20" width="5" height="4" rx="1" />
                    <rect x="17.5" y="20" width="5" height="4" rx="1" />
                    <rect x="26" y="20" width="5" height="4" rx="1" />
                    <rect x="9" y="28" width="5" height="4" rx="1" />
                    <rect x="17.5" y="28" width="5" height="4" rx="1" />
                    <rect x="26" y="28" width="5" height="4" rx="1" />
                  </svg>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: "1.2cqw", fontWeight: 300, color: "#555" }}>EMITIDO EM</div>
                    <div style={{ fontSize: "1.45cqw", fontWeight: 700, color: "#1a2a6c" }}>{dataEmissao}</div>
                  </div>
                </div>
              )}
              {dataEmissao && codigo && <div style={{ width: 1.5, height: "3.6cqw", background: "#1a2a6c" }} />}
              {codigo && (
                <div style={{ display: "flex", alignItems: "center", gap: "1cqw" }}>
                  <svg viewBox="0 0 40 44" style={{ width: "3.4cqw", height: "3.7cqw" }} fill="none" stroke="#f5cf62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 3 L35 8 V21 C35 31 28 38 20 41 C12 38 5 31 5 21 V8 Z" />
                    <path d="M13 21 L18.5 26.5 L28 15.5" />
                  </svg>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontSize: "1.2cqw", fontWeight: 300, color: "#555" }}>CÓDIGO DE VALIDAÇÃO</div>
                    <div style={{ fontSize: "1.45cqw", fontWeight: 700, color: "#1a2a6c" }}>{codigo}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* rodapé */}
        <p
          style={{
            position: "absolute",
            right: "3.8%",
            bottom: "7%",
            margin: 0,
            fontSize: "1.25cqw",
            color: "#444",
          }}
        >
          Orcoma Academy - https://academy.orcomacontabilidade.com.br
        </p>
      </div>

      {!preview && (
      <button
        onClick={handleExportar}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 24px",
          background: "linear-gradient(135deg, #ff9d00, #e8941a)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(255,157,0,0.3)",
        }}
      >
        <i className="fa-solid fa-download" />
        Exportar como imagem
      </button>
      )}
    </div>
  );
}
