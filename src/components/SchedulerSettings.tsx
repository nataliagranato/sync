import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import {
  Clock,
  Wifi,
  BatteryCharging,
  BatteryLow,
  RefreshCw,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Play,
  ShieldCheck
} from 'lucide-react';

export const SchedulerSettings: React.FC = () => {
  const { schedule, updateSchedule, startSync, isSyncing, addNotification } = useSync();

  const [testSuccessNotice, setTestSuccessNotice] = useState(false);

  const handleToggle = (key: keyof typeof schedule) => {
    updateSchedule({ [key]: !schedule[key] });
  };

  const handleTestScheduledRun = () => {
    addNotification({
      type: 'info',
      title: 'Disparo Automático do Agendador',
      message: 'Verificando condições: Wi-Fi ativo, conectado à alimentação. Iniciando...'
    });
    startSync(undefined, 'both');
    setTestSuccessNotice(true);
    setTimeout(() => setTestSuccessNotice(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#888]" />
            <h1 className="text-xl font-bold text-[#fafafa] tracking-tight">
              Agendamento Automático de Backups
            </h1>
          </div>

          {/* Master Enable Switch */}
          <button
            id="btn-toggle-schedule-master"
            onClick={() => handleToggle('enabled')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              schedule.enabled
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-[#161616] text-[#888] border border-[#333]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                schedule.enabled ? 'bg-green-400 animate-pulse' : 'bg-[#666]'
              }`}
            ></span>
            <span>{schedule.enabled ? 'Agendador Ativo' : 'Agendador Pausado'}</span>
          </button>
        </div>
        <p className="text-xs text-[#888] max-w-2xl">
          Configure a frequência com que o aplicativo inspeciona fotos, documentos e contatos do dispositivo para efetuar a sincronização silenciosa em segundo plano. Sem esforço, sem interrupções.
        </p>
      </div>

      {/* Scheduler Status Banner */}
      <div className="p-5 rounded-2xl border border-[#333] bg-[#111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#666] font-mono font-bold">
            Próxima Janela de Execução
          </span>
          <div className="text-base font-bold text-[#fafafa] flex items-center gap-2">
            <span>{schedule.nextRunTime}</span>
            <span className="text-xs font-normal text-[#888] font-mono">
              (Janela noturna inteligente)
            </span>
          </div>
          <p className="text-[11px] text-[#666]">
            Última execução bem-sucedida: {schedule.lastRunTime || 'Hoje às 14:20'}
          </p>
        </div>

        <button
          onClick={handleTestScheduledRun}
          disabled={isSyncing}
          className="px-4 py-2 rounded-md bg-[#161616] border border-[#333] text-xs font-semibold text-[#fafafa] hover:border-[#555] hover:bg-[#222] transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 text-blue-400" />
          <span>Simular Disparo do Agendador</span>
        </button>
      </div>

      {/* Rules and Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frequency Card */}
        <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#888]" />
            <h2 className="text-sm font-bold text-[#fafafa]">Frequência da Sincronização</h2>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'realtime',
                label: 'Tempo Real (Sempre que uma foto/vídeo for salvo)',
                desc: 'Detecta alterações imediatamente no rolo da câmera'
              },
              {
                id: 'hourly',
                label: 'De hora em hora',
                desc: 'Verificações periódicas em segundo plano'
              },
              {
                id: 'daily',
                label: 'Diariamente às 03:00 (Recomendado)',
                desc: 'Durante a madrugada, sem impacto na experiência de uso'
              },
              {
                id: 'weekly',
                label: 'Semanalmente',
                desc: 'Aos domingos à meia-noite'
              }
            ].map(item => (
              <label
                key={item.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  schedule.frequency === item.id
                    ? 'border-[#555] bg-[#1a1a1a]'
                    : 'border-[#222] bg-[#161616]/60 hover:bg-[#161616]'
                }`}
              >
                <input
                  type="radio"
                  name="schedule-frequency"
                  value={item.id}
                  checked={schedule.frequency === item.id}
                  onChange={() => updateSchedule({ frequency: item.id as any })}
                  className="mt-0.5 text-white bg-[#111] border-[#333] accent-white"
                />
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-semibold text-[#fafafa]">{item.label}</p>
                  <p className="text-[11px] text-[#888]">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Network and Battery Conditions Card */}
        <div className="p-6 rounded-2xl border border-[#333] bg-[#111] space-y-4">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#888]" />
            <h2 className="text-sm font-bold text-[#fafafa]">Condições do Dispositivo</h2>
          </div>

          <div className="space-y-3">
            {/* Wi-Fi only */}
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#fafafa]">Somente em redes Wi-Fi</p>
                  <p className="text-[11px] text-[#888]">Evita consumo de dados móveis 5G/4G</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={schedule.wifiOnly}
                onChange={() => handleToggle('wifiOnly')}
                className="rounded bg-[#111] border-[#333] accent-white cursor-pointer w-4 h-4"
              />
            </div>

            {/* Charging only */}
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center text-green-400">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#fafafa]">Apenas conectado à energia</p>
                  <p className="text-[11px] text-[#888]">Preserva a bateria durante processamento local</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={schedule.chargingOnly}
                onChange={() => handleToggle('chargingOnly')}
                className="rounded bg-[#111] border-[#333] accent-white cursor-pointer w-4 h-4"
              />
            </div>

            {/* Low Power Mode pause */}
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center text-amber-400">
                  <BatteryLow className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#fafafa]">Pausar em Modo de Pouca Bateria</p>
                  <p className="text-[11px] text-[#888]">Suspende uploads se o dispositivo estiver abaixo de 20%</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={schedule.lowPowerPause}
                onChange={() => handleToggle('lowPowerPause')}
                className="rounded bg-[#111] border-[#333] accent-white cursor-pointer w-4 h-4"
              />
            </div>

            {/* Background fetch */}
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#fafafa]">Atualização Silenciosa em Segundo Plano</p>
                  <p className="text-[11px] text-[#888]">Sincroniza automaticamente sem interromper suas atividades</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={schedule.backgroundFetchEnabled}
                onChange={() => handleToggle('backgroundFetchEnabled')}
                className="rounded bg-[#111] border-[#333] accent-white cursor-pointer w-4 h-4"
              />
            </div>

            {/* Run on app exit / close */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/20 to-[#161616] border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#fafafa]">Continuar Backup ao Sair ou Fechar o App</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Segundo Plano
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888] mt-0.5">
                    Caso você minimize a tela, feche a aba ou saia do app, a proteção e o envio continuam sem interrupções.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="toggle-run-on-close"
                checked={schedule.runOnAppClose}
                onChange={() => handleToggle('runOnAppClose')}
                className="rounded bg-[#111] border-[#333] accent-white cursor-pointer w-4 h-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
