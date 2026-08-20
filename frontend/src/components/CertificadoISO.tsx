import { useRef } from "react";
import html2canvas from "html2canvas";
import logo2 from "../assets/images/logo2.png";
import isoCertificado from "../assets/images/iso_certificado.png";
import olandson from "../assets/images/olandson.png";

const DEFAULT_TEMAS =
  "O que é ISO; Princípios da qualidade; Requisitos e suas particularidades: 4. Contexto da Organização, 5. Liderança, 6. Planejamento, 7. Apoio, 8 Operação, 9. Avaliação de Desempenho, 10. Melhorias; Declarações Institucionais Orcoma Contabilidade; Política da Qualidade Orcoma;";

interface CertificadoISOProps {
  participante?: string;
  curso?: string;
  tipoInscricao?: string;
  cargaHoraria?: string | number;
  temas?: string;
  dataEmissao?: string;
  gestorNome?: string;
  gestorCargo?: string;
  logoUrl?: string;
  seloUrl?: string;
}

export default function CertificadoISO({
  participante = "Nome do Participante",
  curso = "Simplificando a ISO 9001:2015",
  tipoInscricao = "Inscrição Aberta",
  cargaHoraria = 2,
  temas = DEFAULT_TEMAS,
  dataEmissao = "",
  logoUrl = "",
  seloUrl = "",
}: CertificadoISOProps) {
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
          aspectRatio: "980 / 693",
          background: "#ffffff",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(15,23,60,0.25)",
          fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
        }}
      >
        <svg
          viewBox="0 0 980 693"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="navyBorder" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#141B4D" />
              <stop offset="100%" stopColor="#1B2B6B" />
            </linearGradient>
            <linearGradient id="silverFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C9CEDC" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="980" height="693" fill="url(#navyBorder)" />

          <path
            d="M 60,0
               H 980 V 693
               H 60
               C 200,693 280,560 200,470
               C 120,380 120,313 200,223
               C 280,133 200,0 60,0
               Z"
            fill="#ffffff"
          />

          <rect x="0" y="0" width="60" height="693" fill="url(#silverFade)" opacity={0.6} />
        </svg>

        <img
          src={isoCertificado}
          alt=""
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%) rotate(-8deg)",
            width: "60%",
            opacity: 0.1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "38px 60px 16px 100px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 52px)",
              fontWeight: 800,
              color: "#141B4D",
              letterSpacing: 2,
              margin: "6px 0 18px",
            }}
          >
            CERTIFICADO
          </h1>

          <p style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: "4px 0" }}>
            Certificamos que
          </p>

          <p
            style={{
              fontSize: "clamp(20px, 2.6vw, 26px)",
              fontWeight: 800,
              color: "#111",
              margin: "6px 0 10px",
            }}
          >
            {participante}
          </p>

          <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: "4px 0 10px" }}>
            Concluiu o curso com a carga horária de {cargaHoraria} horas
          </p>

          <p
            style={{
              fontSize: "clamp(22px, 3vw, 30px)",
              fontWeight: 800,
              color: "#111",
              margin: "4px 0 8px",
            }}
          >
            {curso}
          </p>

          <p style={{ fontSize: 17, fontWeight: 600, color: "#222", margin: "0 0 16px" }}>
            {tipoInscricao}
          </p>

          {temas && (
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "#222",
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              <strong>Temas abordados:</strong> {temas}
            </p>
          )}

          {dataEmissao && (
            <p style={{ fontSize: 12, color: "#555", marginTop: 10 }}>
              Emitido em {dataEmissao}
            </p>
          )}

          <div style={{ flex: 1 }} />

          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <div style={{ width: 165, flexShrink: 0 }}>
              <img src={seloUrl || isoCertificado} alt="Selo ISO 9001:2015" style={{ width: "100%" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{ textAlign: "left", paddingRight: 24 }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Orcoma" style={{ height: 46 }} />
                ) : (
                  <img src={logo2} alt="Orcoma Academy" style={{ height: 69 }} />
                )}
              </div>

              <div style={{ borderLeft: "2px solid #ccc", height: 50, marginRight: 24 }} />

              <div style={{ textAlign: "center" }}>
                <img src={olandson} alt="Assinatura Olandson" style={{ height: 90 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

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
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(255,157,0,0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255,157,0,0.3)";
        }}
      >
        <i className="fa-solid fa-download" />
        Exportar como imagem
      </button>
    </div>
  );
}
