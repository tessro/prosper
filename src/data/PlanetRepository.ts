type PlanetType = 'rocky' | 'gaseous';

interface PlanetInfo {
  id: string;
  type: PlanetType;
  code: string;
  name: string;
  mass: number;
  radius: number;
  radiation: number;
  magneticField: number;
  sunlight: number;
  gravity: number;
  pressure: number;
  temperature: number;
  fertility: number | null;
}

export class Planet {
  readonly id: string;
  readonly type: PlanetType;
  readonly code: string;
  readonly name: string;
  readonly mass: number;
  readonly radius: number;
  readonly radiation: number;
  readonly magneticField: number;
  readonly sunlight: number;
  readonly gravity: number;
  readonly pressure: number;
  readonly temperature: number;
  readonly fertility: number | null;

  constructor(info: PlanetInfo) {
    this.id = info.id;
    this.type = info.type;
    this.code = info.code;
    this.name = info.name;
    this.mass = info.mass;
    this.radius = info.radius;
    this.radiation = info.radiation;
    this.magneticField = info.magneticField;
    this.sunlight = info.sunlight;
    this.gravity = info.gravity;
    this.pressure = info.pressure;
    this.temperature = info.temperature;
    this.fertility = info.fertility;
  }

  get isFertile(): boolean {
    return this.fertility !== null;
  }

  get isGaseous(): boolean {
    return this.type === 'gaseous';
  }

  get isRocky(): boolean {
    return this.type === 'rocky';
  }

  get isLowGravity(): boolean {
    return this.gravity < 0.25;
  }

  get isHighGravity(): boolean {
    return this.gravity > 2.5;
  }

  get isLowPressure(): boolean {
    return this.pressure < 0.25;
  }

  get isHighPressure(): boolean {
    return this.pressure > 2.0;
  }

  get isLowTemperature(): boolean {
    return this.temperature < -25;
  }

  get isHighTemperature(): boolean {
    return this.temperature > 75;
  }
}

export class PlanetRepository {
  private readonly planets: Planet[] = [];
  private readonly byCode: Record<string, Planet> = {};

  static default(): PlanetRepository {
    return new PlanetRepository();
  }

  all(): Planet[] {
    return this.planets;
  }

  async findByCode(code: string): Promise<Planet | null> {
    const cached = this.byCode[code.toLowerCase()];
    if (cached) return cached;

    const remote = await this.fetch(code);
    if (remote) {
      this.planets.push(remote);
      this.byCode[remote.code] = remote;
      return remote;
    }

    return null;
  }

  private async fetch(code: string): Promise<Planet | null> {
    const result = await fetch(`https://rest.fnar.net/planet/${code}`);
    const data = await result.json();

    return new Planet({
      id: data.PlanetId,
      type: data.Surface ? 'rocky' : 'gaseous',
      code: data.PlanetNaturalId,
      name: data.PlanetName,
      mass: data.Mass,
      radius: data.Radius,
      radiation: data.Radiation,
      magneticField: data.MagneticField,
      sunlight: data.Sunlight,
      gravity: data.Gravity,
      pressure: data.Pressure,
      temperature: data.Temperature,
      fertility: data.Fertility === -1 ? null : data.Fertility,
    });
  }
}
