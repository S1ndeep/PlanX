const CityCard = ({ city }) => {
  const formatPopulation = (pop) => {
    if (!pop || pop === 0) return "N/A";
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
    return pop.toString();
  };

  return (
    <div className="card city-card">
      <div className="card-title">{city.name}</div>
      <div className="card-subtitle">{city.region}</div>
      <div className="city-info">
        <div className="info-item">
          <span className="info-label">Country:</span> {city.country}
        </div>
        <div className="info-item">
          <span className="info-label">Population:</span>{" "}
          {formatPopulation(city.population)}
        </div>
        {city.latitude && city.longitude && (
          <div className="info-item">
            <span className="info-label">Coordinates:</span>{" "}
            {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
          </div>
        )}
      </div>
      <button className="btn btn-outline view-details-btn" type="button">
        View Details
      </button>
    </div>
  );
};

export default CityCard;
