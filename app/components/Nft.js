

export const Nft = ({ metadata, selected, setSelectedNft }) => {
  return (
    <div className="w-28 m-1">
      <img 
        onClick={() => { setSelectedNft(metadata) }}
        src={metadata.src} 
        className={"rounded-md w-full ".concat(selected ? "ring-4" : "")}
      />
    </div>
  );
}
 
