import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

interface WeatherData {
  name: string;
  sys: { country: string };
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  weather: Array<{ description: string; icon: string }>;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
}

interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
}

@Component({
  selector: 'app-weather-data',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app-weather-data.component.html',
  styleUrl: './app-weather-data.component.scss'
})
export class WeatherDataComponent implements OnInit {
  city: string = '';
  weatherData: WeatherData | null = null;
  errorMessage: string = '';
  suggestions: CitySuggestion[] = [];
  private citySubject = new Subject<string>();
  private apiKey = 'jdfljdsflkdjflkjdflkjdslkf8437984759847598475fjldsjfldskjfd';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.citySubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(city => this.getCitySuggestions(city))
    ).subscribe(
      suggestions => {
        this.suggestions = suggestions;
        this.errorMessage = '';
      },
      error => {
        console.error('Error fetching suggestions:', error);
        this.suggestions = [];
      }
    );
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.citySubject.next(input.value);
  }

  getCitySuggestions(city: string) {
    if (city.length < 3) {
      return of([]);
    }
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${this.apiKey}`;
    return this.http.get<CitySuggestion[]>(url);
  }

  selectCity(suggestion: CitySuggestion) {
    this.city = suggestion.name;
    this.suggestions = [];
    this.getWeather();
  }

  getWeather() {
    if (!this.city.trim()) {
      this.errorMessage = 'Please enter a city name.';
      return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}`;

    this.http.get<WeatherData>(url).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.errorMessage = '';
        this.suggestions = [];
      },
      error: (error) => {
        console.error('Error fetching weather data:', error);
        if (error.error && error.error.message) {
          this.errorMessage = `Error: ${error.error.message}`;
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
        this.weatherData = null;
      }
    });
  }

  getFormattedDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }
}