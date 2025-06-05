To view Readme.txt please visit https://firms.modaps.eosdis.nasa.gov/download/Readme.txt
| Column          | Description                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **latitude**    | The geographic latitude where the fire or thermal anomaly was detected.                                                                                         |
| **longitude**   | The geographic longitude of the detection.                                                                                                                      |
| **brightness**  | This indicates the temperature (in Kelvin) measured in the mid-infrared band; **higher values mean hotter fires**. Often used as the **target variable** in ML. |
| **scan**        | The spatial resolution in the east–west direction (in degrees).                                                                                                 |
| **track**       | The spatial resolution in the north–south direction (in degrees).                                                                                               |
| **acq\_date**   | The date the data was acquired.                                                                                                                                 |
| **acq\_time**   | The time the satellite passed over the location (in HHMM format).                                                                                               |
| **satellite**   | Satellite identifier (e.g., “N” for NOAA-20, “A” for Suomi-NPP).                                                                                                |
| **instrument**  | The instrument that captured the data (e.g., VIIRS = Visible Infrared Imaging Radiometer Suite).                                                                |
| **confidence**  | A qualitative estimate of fire detection confidence. In VIIRS, it's usually a single value like "n" or a percentage in other datasets.                          |
| **version**     | The version of the dataset used.                                                                                                                                |
| **bright\_t31** | Brightness temperature in the thermal IR band 31 (Kelvin), used to detect cloud contamination and validate the fire signal.                                     |
| **frp**         | **Fire Radiative Power** (MW), indicating the intensity of the fire.                                                                                            |
| **daynight**    | Whether the detection happened during the day or night.                                                                                                         |
| **type**        | Indicates type of fire detection: 0 = nominal fire, 1 = saturated, 2 = off-nadir, 3 = small fire.                                                               |
