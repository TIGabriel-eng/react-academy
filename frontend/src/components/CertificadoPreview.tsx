import { useEffect, useRef, useState } from "react";
import CertificadoISO from "./CertificadoISO";
import CertificadoPadrao from "./CertificadoPadrao";
import { formatarData, isCursoISO } from "./CertificadoModal";

const CERT_W = 980;
const CERT_H = 693;

interface CertificadoPreviewProps {
  alunoNome: string;
  cursoTitulo: string;
  emitidoEm: string;
  codigo: string;
  cursoDescricao?: string | null;
  cursoModulos?: string | null;
  cursoDuracao?: string | null;
}

export function CertificadoPreview({
  alunoNome,
  cursoTitulo,
  emitidoEm,
  codigo,
  cursoDescricao,
  cursoModulos,
  cursoDuracao,
}: CertificadoPreviewProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width && height) setScale(Math.min(width / CERT_W, height / CERT_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = formatarData(emitidoEm);
  const temas = cursoDescricao || cursoModulos;

  return (
    <div
      ref={boxRef}
      className="cert-preview"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {scale > 0 && (
        <div style={{ width: CERT_W * scale, height: CERT_H * scale, overflow: "hidden", borderRadius: 4 }}>
          <div style={{ width: CERT_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            {isCursoISO(cursoTitulo) ? (
              <CertificadoISO
                preview
                participante={alunoNome}
                curso={cursoTitulo}
                cargaHoraria={cursoDuracao || "2h"}
                dataEmissao={data}
                {...(temas ? { temas } : {})}
              />
            ) : (
              <CertificadoPadrao preview participante={alunoNome} curso={cursoTitulo} dataEmissao={data} codigo={codigo} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
