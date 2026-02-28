(
s.waitForBoot {

    // =========================
    // CONFIG
    // =========================
    ~audioDir = "C:/Users/dell/Documents/projects/Ars-Electronica/machine_listening/audio_clean/";
    ~audioFiles = [
        "01_assembly.wav",
        "02_chassis.wav",
        "03_chassis_human.wav",
        "04_chasis_tanks.wav",
        "05_chassis_assembly.wav",
        "06_chassis_table_0.wav",
        "06_chassis_table_1.wav",
        "06_chassis_table_2.wav",
        "06_chassis_table_3.wav",
        "07_electric_room.wav",
        "08_welding.wav"
    ];

    // =========================
    // CONTROL BUSES (web-ready)
    // =========================
    ~densityBus = Bus.control(s, 1);   // energía temporal
    ~energyBus  = Bus.control(s, 1);   // presencia

    ~densityBus.set(0.3);
    ~energyBus.set(0.6);

    // =========================
    // LOAD BUFFERS
    // =========================
    ~buffers = List.new;

    ~audioFiles.do { |file|
        var path = ~audioDir ++ file;
        if (File.exists(path)) {
            Buffer.read(s, path, action: { |buf|
                ~buffers.add(buf);
                ("Loaded: " ++ file).postln;
            });
        } {
            ("⚠ Archivo faltante: " ++ path).postln;
        };
    };

    s.sync;
    "ALL BUFFERS READY".postln;

    // =========================
    // SYNTHDEF – MACHINE NODE
    // =========================
    SynthDef(\machineLoop, { |bufnum, basePan = 0|
        var sig;
        var ampRand, amp;
        var densityHuman, energyHuman;
        var densityAuto, energyAuto;
        var densityFinal, energyFinal;
        var panDrift, panPos;
        var distance, filtered;

        // =========================
        // CONTROL HUMANO (WEB / OSC)
        // =========================
        densityHuman = In.kr(~densityBus).linlin(0, 1, 0.05, 1.5);
        energyHuman  = In.kr(~energyBus).linlin(0, 1, 0.05, 1.0);

        // =========================
        // ESTADO AUTÓNOMO (INFRA)
        // =========================
        densityAuto = Lag.kr(
            LFNoise1.kr(0.02).range(0.05, 1.2),
            8
        );

        energyAuto = Lag.kr(
            LFNoise1.kr(0.015).range(0.1, 0.9),
            10
        );

        // =========================
        // FUSIÓN HUMANO + MÁQUINA
        // =========================
        densityFinal = (densityHuman * 0.5) + (densityAuto * 0.5);
        energyFinal  = (energyHuman  * 0.5) + (energyAuto  * 0.5);

        // =========================
        // AMPLITUD ORGÁNICA
        // =========================
        ampRand = LFNoise1.kr(densityFinal).range(0.05, 0.9);
        amp = ampRand * energyFinal;

        // =========================
        // AUDIO SOURCE
        // =========================
        sig = PlayBuf.ar(
            1,
            bufnum,
            BufRateScale.kr(bufnum),
            loop: 1
        );

        // =========================
        // MAPA SONORO (ESPACIO)
        // =========================

        // deriva espacial lenta (no performativa)
        panDrift = LFNoise1.kr(0.01).range(-0.15, 0.15);
        panPos = (basePan + panDrift).clip(-1, 1);

        // distancia simulada (infraestructura)
        distance = LFNoise1.kr(0.005).range(0.3, 1.0);
        filtered = LPF.ar(sig, distance.linexp(0.3, 1.0, 800, 8000));

        // =========================
        // OUTPUT
        // =========================
        Out.ar(0, Pan2.ar(filtered * amp, panPos));
    }).add;

    s.sync;

    // =========================
    // MAPA ESPACIAL (NODOS)
    // =========================
    ~panMap = Array.fill(~buffers.size, { |i|
        (-1.0 + (2.0 * i / (~buffers.size - 1))).clip(-1, 1)
    });

    // =========================
    // START ONE NODE PER WAV
    // =========================
    ~loops = ~buffers.collect { |buf, i|
        if (buf.notNil and: { buf.numFrames > 0 }) {
            Synth(\machineLoop, [
                \bufnum, buf.bufnum,
                \basePan, ~panMap[i]
            ]);
        };
    };

    "All machines initialized as spatial infrastructure.".postln;
    "Waiting for OSC control on /control [density, energy]".postln;

    // =========================
    // OSC CONTROL (FROM WEB)
    // =========================
    OSCdef(\webControl, { |msg|
        var density = msg[1];
        var energy  = msg[2];

        if (density.notNil and: energy.notNil) {
            ~densityBus.set(density.clip(0, 1));
            ~energyBus.set(energy.clip(0, 1));
        };
    }, '/control');

};
)