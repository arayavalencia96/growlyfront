import { ShieldCheck } from "lucide-react";
import { Modal } from "@/common/components/Modal";
import type { ITermsAndConditionsModalProps } from "@/modules/auth/interfaces/auth.interface";

const TERMS_VERSION = "1.0.0";
const EFFECTIVE_DATE = "17 de julio de 2026";

export function TermsAndConditionsModal({
  isOpen,
  onClose,
}: ITermsAndConditionsModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      eyebrow={
        "Versión " + TERMS_VERSION + " · Vigente desde " + EFFECTIVE_DATE
      }
      title="Términos y privacidad"
      onClose={onClose}
    >
      <div className="space-y-6 text-sm leading-6 text-body/70">
        <section>
          <h3 className="mb-2 font-bold text-primary">
            1. Aceptación y alcance
          </h3>
          <p>
            Al crear una cuenta aceptas estos términos y declaras tener
            capacidad legal para utilizar Growly. La aplicación permite
            registrar y organizar objetivos, aportes, retiros, operaciones de
            inversión y sus resultados estimados.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            2. Herramienta informativa
          </h3>
          <p>
            Growly no es una entidad financiera, agente de bolsa ni asesor de
            inversiones. No custodia fondos, no ejecuta operaciones y no
            garantiza rendimientos. Los cálculos y resúmenes son informativos y
            no reemplazan asesoramiento financiero, contable, impositivo o legal
            profesional.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            3. Datos que registras
          </h3>
          <p>
            Tratamos tu nombre, correo electrónico, credenciales protegidas y la
            información financiera que ingreses, como ahorros, ingresos,
            egresos, objetivos, plataformas, activos y operaciones. Se utiliza
            para crear tu cuenta, prestar las funcionalidades, proteger el
            acceso y mostrar tus reportes personales.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            4. Privacidad y confidencialidad
          </h3>
          <p>
            Growly debe aplicar medidas razonables de seguridad y limitar el
            acceso a los datos. La información podrá ser procesada por
            proveedores tecnológicos necesarios para operar la aplicación y no
            deberá venderse ni utilizarse con fines incompatibles sin un nuevo
            consentimiento o una base legal aplicable.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            5. Exactitud y responsabilidad
          </h3>
          <p>
            Eres responsable de ingresar información correcta, mantener la
            confidencialidad de tus credenciales y revisar los resultados antes
            de tomar decisiones. Growly no responde por pérdidas derivadas de
            datos incorrectos, decisiones de inversión o servicios de terceros.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            6. Disponibilidad y cambios
          </h3>
          <p>
            Las funcionalidades pueden modificarse, suspenderse o presentar
            interrupciones. Si existe un cambio material en estos términos, se
            informará una nueva versión y podrá solicitarse una nueva
            aceptación.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            7. Cuenta y conservación
          </h3>
          <p>
            Puedes editar tus datos y desactivar tu cuenta desde Mi perfil. La
            desactivación impide el acceso pero no implica necesariamente la
            eliminación inmediata de registros cuando deban conservarse por
            seguridad, trazabilidad u obligaciones legales.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">
            8. Tus derechos sobre los datos
          </h3>
          <p>
            Puedes solicitar acceso, actualización, rectificación y, cuando
            corresponda, supresión de tus datos personales conforme a la Ley
            argentina 25.326. La versión productiva deberá publicar el canal
            formal para ejercer estos derechos y contactar al responsable.
          </p>
        </section>

        <section>
          <h3 className="mb-2 font-bold text-primary">9. Ley aplicable</h3>
          <p>
            Esta versión base se interpreta conforme a las leyes de la República
            Argentina. La jurisdicción y los datos completos del responsable
            deberán definirse antes del lanzamiento público.
          </p>
        </section>
      </div>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-brand p-4 text-sm text-white/75">
        <ShieldCheck className="mt-0.5 shrink-0 text-accent-text" size={18} />
        <p>
          Al aceptar se registra la fecha y la versión de estos términos para
          mantener constancia del consentimiento.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
      >
        Entendido
      </button>
    </Modal>
  );
}
