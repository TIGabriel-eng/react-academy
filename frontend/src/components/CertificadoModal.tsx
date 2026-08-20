import { useEffect } from "react";
import CertificadoISO from "./CertificadoISO";

interface CertificadoData {
  id: number;
  codigo: string;
  emitido_em: string;
  curso_titulo: string;
  curso_descricao: string | null;
  curso_duracao: string | null;
  curso_modulos: string | null;
  aluno_nome: string;
}

interface CertificadoModalProps {
  certificado: CertificadoData;
  onClose: () => void;
}

export function CertificadoModal({ certificado, onClose }: CertificadoModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(7,17,31,0.85)",
        backdropFilter: "blur(6px)",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1060,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--color-surface, #111827)",
          borderRadius: 16,
          padding: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <CertificadoISO
          participante={certificado.aluno_nome}
          curso={certificado.curso_titulo}
          cargaHoraria={certificado.curso_duracao || "2h"}
          dataEmissao={new Date(certificado.emitido_em).toLocaleDateString("pt-BR")}
          {...(certificado.curso_descricao || certificado.curso_modulos
            ? { temas: certificado.curso_descricao || certificado.curso_modulos || "" }
            : {})}
        />
      </div>
    </div>
  );
}
