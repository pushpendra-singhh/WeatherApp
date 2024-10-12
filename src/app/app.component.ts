import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherDataComponent } from "./app-weather-data/app-weather-data.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherDataComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'weather-application';
}
